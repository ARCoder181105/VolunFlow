import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Award, Loader2, Upload } from 'lucide-react';

const badgeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().min(1, 'Badge image is required'),
  criteria: z.string().min(10, 'Criteria must be at least 10 characters'),
});

export type BadgeFormData = z.infer<typeof badgeSchema>;

interface AddBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const AddBadgeModal: React.FC<AddBadgeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema)
  });

  const handleClose = () => {
    reset();
    setPreviewUrl('');
    onClose();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
       alert('Please select an image file'); return; 
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json();
      setValue('imageUrl', data.url);
      setPreviewUrl(data.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (data: BadgeFormData) => {
    await onSubmit({ ...data, criteria: String(data.criteria) });
    handleClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Award className="w-5 h-5" />
            </div>
            Create New Badge
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="px-6 py-6 space-y-5">
            
            {/* Image Upload */}
            <div className="flex flex-col items-center">
               <div className="relative w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center border-2 border-dashed border-yellow-200 overflow-hidden group hover:border-yellow-400 transition-colors cursor-pointer">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Award className="w-10 h-10 text-yellow-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
               </div>
               <input type="hidden" {...register('imageUrl')} />
               <p className="text-xs text-gray-500 mt-2">Upload Badge Icon</p>
               {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl.message}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge Name</label>
              <input {...register('name')} type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-colors" placeholder="e.g. Super Volunteer" disabled={loading} />
              {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea {...register('description')} rows={2} className="block w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-colors" placeholder="What does this badge represent?" disabled={loading} />
              {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {/* Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Criteria</label>
              <textarea {...register('criteria')} rows={2} className="block w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-colors" placeholder="How do volunteers earn this?" disabled={loading} />
              {errors.criteria && <p className="mt-1.5 text-sm text-red-600">{errors.criteria.message}</p>}
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled={loading || uploading}>Cancel</button>
            <button type="submit" disabled={loading || uploading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 min-w-[120px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddBadgeModal;