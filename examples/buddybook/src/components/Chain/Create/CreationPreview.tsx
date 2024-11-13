import React, { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAccount, useSignMessage } from 'wagmi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import QRCode from '@/components/QRCode';
import { v4 as uuidv4 } from 'uuid';
import { useWaku } from '@waku/react';
import { LightNode } from '@waku/sdk';
import { createMessage, encoder } from '@/lib/waku';
import { useWalletPrompt } from '@/hooks/useWalletPrompt';
import { fromLightPush, Telemetry, TelemetryType, buildExtraData } from '@/lib/telemetry';

interface FormData {
  title: string;
  description: string;
  uuid: string;
}

const DEFAULT_FORM_DATA: FormData = {
  title: 'Devcon24 DeFi Dynamo',
  description: 'A revolutionary blockchain for Devcon 24, focusing on scalable DeFi solutions and cross-chain interoperability.',
  uuid: uuidv4(),
}

const ChainCreationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [createdBlockUUID, setCreatedBlockUUID] = useState<string | null>(null);

  const { node } = useWaku<LightNode>();

  const { address } = useAccount();
  const { signMessage } = useSignMessage({
   mutation: {
    async onSuccess(signature: string) {      
      if (!address || !node) return;

      setSignedMessage(signature);
      const blockUUID = uuidv4();
      setCreatedBlockUUID(blockUUID);
      
      const timestamp = Date.now();
      const message = createMessage({
        chainUUID: formData.uuid,
        blockUUID: blockUUID,
        title: formData.title,
        description: formData.description,
        signedMessage: signature,
        timestamp: timestamp,
        signatures: [{address, signature}],
        parentBlockUUID: null
      });

      try {
        const result = await node?.lightPush.send(encoder, message);
        Telemetry.push(fromLightPush({
          result,
          wallet: address,
          bookId: formData.uuid,
          node,
          encoder,
          timestamp,
        }));
      } catch (e) {
        Telemetry.push([{
          type: TelemetryType.LIGHT_PUSH_FILTER,
          protocol: "lightPush",
          timestamp: timestamp,
          createdAt: timestamp,
          seenTimestamp: timestamp,
          peerId: node.peerId.toString(),
          contentTopic: encoder.contentTopic,
          pubsubTopic: encoder.pubsubTopic,
          ephemeral: encoder.ephemeral,
          messageHash: uuidv4(),
          errorMessage: (e as Error)?.message ?? "Error during LightPush",
          extraData: buildExtraData({
            wallet: address,
            bookId: formData.uuid,
          }),
        }]);
        throw e;
      }

      setIsSuccess(true);
      setIsSigning(false);
    },
    onError(error: Error) {
      console.error('Error signing message:', error);
      setIsSigning(false);
      setSendError('Error signing message. Please try again.');
    }
   }
  });

  const { ensureWalletConnected } = useWalletPrompt();

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
    if (!ensureWalletConnected()) {
      return;
    }
    if (validateForm()) {
      setShowModal(true);
    }
  };

  const handleSubmit = async () => {
    setIsSigning(true);
    setSendError(null);
    const message = `Create Book:
                    Book UUID: ${formData.uuid}
                    Title: ${formData.title}
                    Description: ${formData.description}
                    Timestamp: ${new Date().getTime()}
                    Signed by: ${address}`;
    signMessage({ message });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSuccess(false);
    setIsSigning(false);
    setSendError(null);
    setCreatedBlockUUID(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Book</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateChain} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Book Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={50}
              className="text-base sm:text-sm"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Book Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={500}
              className="min-h-[100px] text-base sm:text-sm"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <Button type="submit" className="w-full py-6 text-base sm:py-2 sm:text-sm">Create Book</Button>
        </form>
      </CardContent>
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isSuccess ? "Book Created" : "Book Preview"}</DialogTitle>
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
              {signedMessage && createdBlockUUID && (
                <>
                  <div className="flex flex-col items-center space-y-4">
                    <QRCode
                      text={`${window.location.origin}${import.meta.env.BASE_URL}sign/${formData.uuid}/${createdBlockUUID}`}
                      width={200}
                      height={200}
                    />
                    <p className="text-sm text-center break-all">
                      {`${window.location.origin}${import.meta.env.BASE_URL}sign/${formData.uuid}/${createdBlockUUID}`}
                    </p>
                    <Button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}${import.meta.env.BASE_URL}sign/${formData.uuid}/${createdBlockUUID}`)}
                      variant="outline"
                    >
                      Copy Link
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChainCreationForm;
