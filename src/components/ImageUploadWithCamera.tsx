import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadWithCameraProps {
  label: string;
  value?: string;
  onChange: (base64: string | undefined) => void;
  accept?: string;
}

export const ImageUploadWithCamera = ({ 
  label, 
  value, 
  onChange, 
  accept = 'image/png,image/jpeg,image/jpg' 
}: ImageUploadWithCameraProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (PNG, JPG, JPEG)');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
      setIsLoading(false);
      toast.success(`${label} uploaded successfully`);
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  };

  const handleCameraClick = () => {
    if (cameraRef.current) {
      cameraRef.current.click();
    }
  };

  const handleUploadClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {value ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-primary/30 shadow-md group">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <Check className="w-3 h-3" />
            Uploaded
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 w-8 h-8 bg-destructive/90 backdrop-blur-sm text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive transition-all duration-200 shadow-lg hover:scale-110"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Drop zone */}
          <div
            onClick={handleUploadClick}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-border/60 hover:border-primary/50 hover:bg-muted/30'
            } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
              dragActive ? 'bg-primary/20' : 'bg-muted'
            }`}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : dragActive ? (
                <ImageIcon className="w-5 h-5 text-primary" />
              ) : (
                <Upload className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center px-2">
              {isLoading ? 'Processing...' : dragActive ? 'Drop image here' : 'Click or drag to upload'}
            </p>
          </div>

          {/* Action buttons - Professional styling */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCameraClick}
              disabled={isLoading}
              className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 font-medium h-10 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Camera className="w-4 h-4 mr-1.5 relative z-10" />
              <span className="relative z-10 text-xs">Take Photo</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              disabled={isLoading}
              className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium h-10 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Upload className="w-4 h-4 mr-1.5 relative z-10" />
              <span className="relative z-10 text-xs">Upload</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Hidden file input for gallery */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-label={`Upload ${label}`}
      />
      
      {/* Hidden camera input - Fixed for mobile compatibility */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        aria-label={`Take photo for ${label}`}
      />
    </div>
  );
};
