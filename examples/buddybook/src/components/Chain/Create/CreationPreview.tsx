import React, { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAccount, useSignMessage } from 'wagmi'
import { useWaku } from '@waku/react';
import { createMessage, encoder } from '@/lib/waku';
import type {LightNode} from '@waku/sdk'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import QRCode from '@/components/QRCode';

interface FormData {
  title: string;
  description: string;
}

const DEFAULT_FORM_DATA = {
  title: 'Devcon24 DeFi Dynamo',
  description: 'A revolutionary blockchain for Devcon 24, focusing on scalable DeFi solutions and cross-chain interoperability.',
}

const ChainCreationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const { node } = useWaku<LightNode>();

  const { address } = useAccount();
  const { signMessage } = useSignMessage({mutation: {
    async onSuccess(data) {
      setSignedMessage(data);
      console.log('Message signed:', data);
      if (!node) return;
      const wakuMessage = createMessage({
        title: formData.title,
        description: formData.description,
        signedMessage: data,
        timestamp: Date.now()
      })
      const {failures, successes} = await node.lightPush.send(encoder, wakuMessage);
      console.log('Failures:', failures);
      console.log('Successes:', successes);
      if (failures.length > 0 || successes.length === 0) {
        console.error('Error sending message to Waku network');
        setIsSigning(false);
        setSendError('Failed to send message. Please try signing again.');
      } else {
        setFormData(DEFAULT_FORM_DATA);
        setIsSigning(false);
        setIsSuccess(true);
        setSendError(null);
      }
    },
    onError(error) {
      console.error('Error signing message:', error);
      setIsSigning(false);
      setSendError('Error signing message. Please try again.');
    }
  }});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateChain = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowModal(true);
    }
  };

  const handleSubmit = async () => {
    setIsSigning(true);
    setSendError(null);
    const message = `Chain Creation Request:
                    Title: ${formData.title}
                    Description: ${formData.description}
                    Created by: ${address}
                      `;

    signMessage({ message });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSuccess(false);
    setIsSigning(false);
    setSendError(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Chain</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateChain} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Chain Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={50}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Chain Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={500}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <Button type="submit" className="w-full">Create Chain</Button>
        </form>
      </CardContent>
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isSuccess ? "Chain Created" : "Chain Preview"}</DialogTitle>
          </DialogHeader>
          {!isSuccess ? (
            <>
              <div className="space-y-4">
                <h4 className="text-xl font-semibold">{formData.title}</h4>
                <p className="text-muted-foreground">{formData.description}</p>
                {sendError && <p className="text-sm text-destructive">{sendError}</p>}
              </div>
              <DialogFooter className="sm:justify-start">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Edit
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={isSigning}>
                  {isSigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    'Sign'
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {signedMessage && (
                <QRCode
                  data={{
                    title: formData.title,
                    description: formData.description,
                    signedMessage: signedMessage,
                    timestamp: Date.now()
                  }}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChainCreationForm;
