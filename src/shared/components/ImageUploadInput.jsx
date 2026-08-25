import { useRef, useState } from 'react';
import { ImagePlus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from './Button.jsx';
import { uploadImageApi } from '../../lib/api/uploads.api.js';
import { resolveAssetUrl } from '../../lib/asset-url.js';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024;

export const ImageUploadInput = ({ label = 'صورة', value = '', onChange, hint }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('يُسمح فقط بصور JPG أو PNG أو WEBP أو GIF.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت.');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadImageApi(file);
      onChange(res?.url || '');
    } catch (err) {
      setError(err?.message || 'فشل رفع الصورة. تأكد أن الملف صورة صالحة.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-txt-primary">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={resolveAssetUrl(value)}
            alt="معاينة الصورة"
            className="w-16 h-16 object-cover rounded-lg border border-border-default shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg border border-dashed border-border-default flex items-center justify-center text-txt-muted shrink-0">
            <ImagePlus className="w-5 h-5" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />

        <Button
          type="button"
          size="sm"
          variant="outline"
          icon={ImagePlus}
          isLoading={uploading}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? 'تغيير الصورة' : 'اختر صورة'}
        </Button>

        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={Trash2}
            onClick={() => onChange('')}
            aria-label="حذف الصورة"
            title="حذف الصورة"
          />
        )}
      </div>

      {hint && !error && <p className="text-xs text-txt-muted">{hint}</p>}
      {error && (
        <p className="text-xs text-status-danger flex items-center gap-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default ImageUploadInput;
