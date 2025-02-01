import { useState } from 'react';
import { useToast } from './ui/use-toast';

console.log('API URL:', import.meta.env.VITE_API_URL);

export function AudioRecorder() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!audioBlob) {
      toast({
        title: 'Error',
        description: 'No audio recording to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      console.log('Making request to:', `${import.meta.env.VITE_API_URL}/api/analyze`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to analyze audio: ${response.status} ${responseText}`);
      }

      // Handle successful response
      toast({
        title: 'Success',
        description: 'Audio analyzed successfully',
      });
    } catch (error) {
      console.error('Error details:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze audio',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      {/* Add your recording UI here */}
    </div>
  );
} 