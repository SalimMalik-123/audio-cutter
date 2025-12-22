import { useCallback } from 'react';
import { Upload, Music } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && isValidAudioFile(file)) {
        onFileSelect(file);
      } else if (file) {
        alert('Please select a valid audio file (MP3, WAV, M4A, OGG, FLAC)');
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file && isValidAudioFile(file)) {
        onFileSelect(file);
      } else if (file) {
        alert('Please select a valid audio file (MP3, WAV, M4A, OGG, FLAC)');
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Music size={64} className="text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Audio Cutter
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Professional audio editing in your browser
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
        >
          <div className="text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Upload Your Audio File
            </h2>
            <p className="text-gray-600 mb-6">
              Drag and drop or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Supports MP3, WAV, M4A, OGG, FLAC • Max size: 500MB
            </p>

            <label className="inline-block">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-lg touch-manipulation">
                <Upload size={24} />
                Choose File
              </span>
            </label>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Features:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Multiple cut regions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Zoom & scroll waveform
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Precise millisecond editing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Batch export as ZIP
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Mobile-friendly interface
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                100% client-side processing
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your files are processed locally in your browser.</p>
          <p>No uploads. No servers. Complete privacy.</p>
        </div>
      </div>
    </div>
  );
};

const isValidAudioFile = (file: File): boolean => {
  const validTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/ogg',
    'audio/flac',
  ];
  return validTypes.includes(file.type) || /\.(mp3|wav|m4a|ogg|flac)$/i.test(file.name);
};
