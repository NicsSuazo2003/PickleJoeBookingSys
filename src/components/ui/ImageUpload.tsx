import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  folder = 'courts', 
  label = 'Upload Image',
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('admin_token');
      const clientSubdomain = import.meta.env.VITE_CLIENT_SUBDOMAIN ?? 'picklejoe';
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(
        `${apiBaseUrl}/api/files/upload?folder=${folder}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Client-Subdomain': clientSubdomain,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    if (onRemove) onRemove();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium text-cream">{label}</label>}
      
      <div className="flex items-start gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        {value ? (
          <div className="relative group">
            <div className="relative rounded-lg overflow-hidden border border-forest-500 w-32 h-32">
              <img 
                src={value} 
                alt="Uploaded" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=Error';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white transition"
                  title="Change image"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-32 h-32 rounded-lg border-2 border-dashed border-forest-500 hover:border-gold-400 transition flex flex-col items-center justify-center gap-2 text-cream-muted hover:text-cream disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
            ) : (
              <>
                <Image className="h-8 w-8" />
                <span className="text-xs text-center">Upload Image</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}