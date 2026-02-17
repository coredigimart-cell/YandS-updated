import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Camera, X, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

export interface DentsScratchesData {
  notes: string;
  images: string[];
}

interface DentsScratchesReportProps {
  value: DentsScratchesData;
  onChange: (data: DentsScratchesData) => void;
}

export const defaultDentsScratches: DentsScratchesData = {
  notes: '',
  images: [],
};

export function DentsScratchesReport({ value, onChange }: DentsScratchesReportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleNotesChange = (notes: string) => {
    onChange({ ...value, notes });
  };

  const processFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (PNG, JPG, JPEG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onChange({
        ...value,
        images: [...value.images, base64],
      });
      setIsLoading(false);
      toast.success('Photo added successfully');
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      processFile(file);
    });

    e.target.value = '';
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    
    processFile(files[0]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = value.images.filter((_, i) => i !== index);
    onChange({ ...value, images: newImages });
    toast.success('Photo removed');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Dents & Scratches Report</h3>
          <p className="text-xs text-muted-foreground">Document any existing damage to the vehicle</p>
        </div>
      </div>

      {/* Notes Textarea */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          Damage Description
        </Label>
        <Textarea
          placeholder="Describe any dents, scratches, or damage in detail...&#10;&#10;Example:&#10;- Small scratch on rear left door&#10;- Minor dent on front bumper&#10;- Paint chip on hood"
          value={value.notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="input-styled min-h-32 resize-none"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <span className="text-lg">📸</span>
          Damage Photos
        </Label>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Take Photo Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isLoading}
            className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 hover:border-primary/60 text-primary hover:text-primary font-medium h-12 px-4 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Camera className="w-5 h-5 mr-2 relative z-10" />
            <span className="relative z-10">Take Photo</span>
          </Button>

          {/* Upload Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="relative overflow-hidden bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/30 hover:border-accent/60 text-accent hover:text-accent font-medium h-12 px-4 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Upload className="w-5 h-5 mr-2 relative z-10" />
            <span className="relative z-10">Upload Photos</span>
          </Button>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          )}
        </div>

        {/* Image Previews */}
        <div className="flex flex-wrap gap-3 mt-4">
          {value.images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Damage ${index + 1}`}
                className="w-28 h-28 object-cover rounded-xl border-2 border-border shadow-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="
                  absolute -top-2 -right-2 w-7 h-7 rounded-full 
                  bg-destructive text-white flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity
                  shadow-lg hover:bg-destructive/90 hover:scale-110
                "
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>

        {value.images.length === 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            <ImageIcon className="w-4 h-4" />
            No photos added yet. Take or upload photos of any damage.
          </p>
        )}

        {value.images.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {value.images.length} photo{value.images.length !== 1 ? 's' : ''} added
          </p>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload damage photos"
      />
      
      {/* Camera Input - with capture attribute for mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
        aria-label="Take photo of damage"
      />
    </div>
  );
}
