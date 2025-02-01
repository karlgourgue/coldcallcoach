import { AudioUploader } from './components/AudioRecorder';
import { Toaster } from './components/ui/toaster';

export default function App() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Cold Call Coach</h1>
      <AudioUploader />
      <Toaster />
    </main>
  );
}
