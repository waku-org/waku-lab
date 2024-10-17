import React, { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useAccount, useSignMessage } from 'wagmi'

interface FormData {
  title: string;
  description: string;
}

const ChainCreationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: 'Devcon24 DeFi Dynamo',
    description: 'A revolutionary blockchain for Devcon 24, focusing on scalable DeFi solutions and cross-chain interoperability.',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const { address } = useAccount();
  const { signMessage } = useSignMessage({mutation: {
    onSuccess(data) {
      console.log('Message signed:', data);
      console.log('Form submitted:', formData);
      setFormData({ title: 'Devcon24 DeFi Dynamo', description: 'A revolutionary blockchain for Devcon 24, focusing on scalable DeFi solutions and cross-chain interoperability.' });
      setShowPreview(false);
    },
    onError(error) {
      console.error('Error signing message:', error);
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
      setShowPreview(true);
    }
  };

  const handleSubmit = async () => {
    const message = `Chain Creation Request:
                    Title: ${formData.title}
                    Description: ${formData.description}
                    Created by: ${address}
                      `;

    signMessage({ message });
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
      {showPreview && (
        <CardFooter className="flex flex-col items-stretch">
          <ChainPreview title={formData.title} description={formData.description} />
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Edit</Button>
            <Button onClick={handleSubmit}>Sign</Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

interface ChainPreviewProps {
  title: string;
  description: string;
}

const ChainPreview: React.FC<ChainPreviewProps> = ({ title, description }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Chain Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-xl font-semibold">{title}</h4>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChainCreationForm;
