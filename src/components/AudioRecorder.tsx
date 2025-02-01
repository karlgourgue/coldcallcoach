import { useToast } from './ui/use-toast';

console.log('API URL:', import.meta.env.VITE_API_URL);

export function AudioUploader() {
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio/')) {
      toast({
        title: 'Error',
        description: 'Please upload an audio file (.wav, .mp3, etc.)',
        variant: 'destructive',
      });
      return;
    }

    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('audio', file);
      
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
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
      />
    </div>
  );
} 