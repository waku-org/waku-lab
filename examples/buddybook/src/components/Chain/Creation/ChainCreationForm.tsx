import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import ChainPreview from '@/components/Chain/Preview/ChainPreview';

interface FormData {
  title: string;
  description: string;
}

const ChainCreationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    if (formData.title) {
      //TODO: Implement ascii art generation
      //   const newAsciiArt = generateAsciiArt(formData.title, formData.description);
      //   setAsciiArt(newAsciiArt);
    }
  }, [formData.title, formData.description]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user starts typing
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Handle form submission (to be implemented with Waku integration)
      console.log('Form submitted:', formData);
      setShowPreview(true);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Chain</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
        <CardFooter>
          <ChainPreview title={formData.title} description={formData.description} asciiArt={asciiArt} />
        </CardFooter>
      )}
    </Card>
  );
};

export default ChainCreationForm;
