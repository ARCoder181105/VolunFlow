import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building, Loader2, Upload, Mail, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import type { NGO } from '../../types/ngo.types';

const ngoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  contactEmail: z.string().email('Invalid email address'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  logoUrl: z.string().optional().or(z.literal('')),
});

export type EditNgoFormData = z.infer<typeof ngoSchema>;

interface EditNgoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditNgoFormData) => Promise<void>;
  loading?: boolean;
  currentNgo: NGO;
}

const EditNgoModal: React.FC<EditNgoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  currentNgo
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentNgo.logoUrl || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<EditNgoFormData>({
    resolver: zodResolver(ngoSchema),
    defaultValues: {
      name: currentNgo.name,
      description: currentNgo.description,
      contactEmail: currentNgo.contactEmail,
      website: currentNgo.website || '',
      logoUrl: currentNgo.logoUrl || ''
    }
  });

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: currentNgo.name,
        description: currentNgo.description,
        contactEmail: currentNgo.contactEmail,
        website: currentNgo.website || '',
        logoUrl: currentNgo.logoUrl || ''
      });
      setPreviewUrl(currentNgo.logoUrl || '');
    }
  }, [isOpen, currentNgo, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
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

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setValue('logoUrl', data.url);
      setPreviewUrl(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (data: EditNgoFormData) => {
    await onSubmit(data);
    handleClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Building className="w-5 h-5" />
            </div>
            Edit NGO Profile
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            
            {/* Logo Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors bg-gray-50 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    {uploading ? (
                       <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                       <Upload className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  disabled={uploading} 
                />
                <input type="hidden" {...register('logoUrl')} />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NGO Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Building className="w-4 h-4" /></div>
                <input {...register('name')} type="text" className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="Organization Name" disabled={loading} />
              </div>
              {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail className="w-4 h-4" /></div>
                <input {...register('contactEmail')} type="email" className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="contact@example.org" disabled={loading} />
              </div>
              {errors.contactEmail && <p className="mt-1.5 text-sm text-red-600">{errors.contactEmail.message}</p>}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Globe className="w-4 h-4" /></div>
                <input {...register('website')} type="url" className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="https://example.org" disabled={loading} />
              </div>
              {errors.website && <p className="mt-1.5 text-sm text-red-600">{errors.website.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <div className="relative">
                 <div className="absolute top-3 left-3 pointer-events-none text-gray-400"><FileText className="w-4 h-4" /></div>
                 <textarea {...register('description')} rows={4} className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="Describe your mission..." disabled={loading} />
              </div>
              {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>}
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled={loading || uploading}>Cancel</button>
            <button type="submit" disabled={loading || uploading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-[120px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditNgoModal;