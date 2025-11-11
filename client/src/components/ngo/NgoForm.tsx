import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Mail, Globe, Loader2, Camera } from 'lucide-react';
import type { CreateNgoInput, NGO } from '../../types/ngo.types';

const ngoSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description is too long'),
  contactEmail: z.string()
    .email('Invalid email address'),
  logoUrl: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

type NgoFormData = z.infer<typeof ngoSchema>;

interface NgoFormProps {
  ngo?: NGO;
  onSubmit: (data: CreateNgoInput) => Promise<void>;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const NgoForm: React.FC<NgoFormProps> = ({
  ngo,
  onSubmit,
  loading = false,
  mode = 'create'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(ngo?.logoUrl || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NgoFormData>({
    resolver: zodResolver(ngoSchema),
    defaultValues: {
      name: ngo?.name || '',
      description: ngo?.description || '',
      contactEmail: ngo?.contactEmail || '',
      logoUrl: ngo?.logoUrl || '',
      website: ngo?.website || '',
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
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

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      setValue('logoUrl', data.url);
      setPreviewUrl(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmitForm = (data: NgoFormData) => {
    const submitData: CreateNgoInput = {
      name: data.name,
      description: data.description,
      contactEmail: data.contactEmail,
      ...(data.logoUrl && { logoUrl: data.logoUrl }),
      ...(data.website && { website: data.website }),
    };
    console.log(submitData)
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 max-w-2xl">
      {/* Logo Upload */}
      <div className="text-center">
        <div className="relative inline-block">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="NGO Logo preview"
              className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
              <Building className="w-16 h-16 text-blue-600" />
            </div>
          )}
          
          <label
            htmlFor="logo-upload"
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading || loading}
            />
          </label>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {previewUrl ? 'Logo ready' : 'Upload NGO logo (optional)'}
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, GIF up to 5MB
          </p>
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="form-label">
          NGO Name *
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('name')}
            type="text"
            className="input-field pl-10"
            placeholder="Enter NGO name"
            disabled={loading}
          />
        </div>
        {errors.name && (
          <p className="form-error">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="form-label">
          Description *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="input-field resize-vertical"
          placeholder="Describe your NGO's mission, values, and the impact you make..."
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          {watch('description')?.length || 0}/500 characters
        </p>
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      {/* Contact Email */}
      <div>
        <label htmlFor="contactEmail" className="form-label">
          Contact Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('contactEmail')}
            type="email"
            className="input-field pl-10"
            placeholder="contact@example.org"
            disabled={loading}
          />
        </div>
        {errors.contactEmail && (
          <p className="form-error">{errors.contactEmail.message}</p>
        )}
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="form-label">
          Website (Optional)
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('website')}
            type="url"
            className="input-field pl-10"
            placeholder="https://example.org"
            disabled={loading}
          />
        </div>
        {errors.website && (
          <p className="form-error">{errors.website.message}</p>
        )}
      </div>

      {/* Hidden logo URL field */}
      <input type="hidden" {...register('logoUrl')} />

      {/* Current logo URL preview */}
      {watch('logoUrl') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            New logo will be saved
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-primary flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Creating NGO...' : 'Updating NGO...'}
            </>
          ) : (
            mode === 'create' ? 'Create NGO' : 'Update NGO'
          )}
        </button>
        
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </button>
      </div>

      {/* Help Text */}
      {mode === 'create' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Creating an NGO</h4>
          <p className="text-sm text-blue-800">
            When you create an NGO, you'll become its administrator. You'll be able to:
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
            <li>Create and manage events</li>
            <li>Design and award badges to volunteers</li>
            <li>Track volunteer participation</li>
            <li>Manage multiple branches (locations)</li>
          </ul>
        </div>
      )}
    </form>
  );
};

export default NgoForm;