import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Award, Camera, Loader2 } from 'lucide-react';
import type { CreateBadgeInput, Badge } from '../../types/badge.types';

const badgeSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description is too long'),
  imageUrl: z.string()
    .url('Must be a valid URL')
    .min(1, 'Badge image is required'),
  criteria: z.string()
    .min(10, 'Criteria must be at least 10 characters')
    .max(500, 'Criteria is too long'),
});

type BadgeFormData = z.infer<typeof badgeSchema>;

interface BadgeFormProps {
  badge?: Badge;
  onSubmit: (data: CreateBadgeInput) => Promise<void>;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const BadgeForm: React.FC<BadgeFormProps> = ({
  badge,
  onSubmit,
  loading = false,
  mode = 'create'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(badge?.imageUrl || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      name: badge?.name || '',
      description: badge?.description || '',
      imageUrl: badge?.imageUrl || '',
      criteria: badge?.criteria || '',
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
      
      setValue('imageUrl', data.url);
      setPreviewUrl(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmitForm = (data: BadgeFormData) => {
    const submitData: CreateBadgeInput = {
      ...data,
      criteria: String(data.criteria), // Ensure criteria is string
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 max-w-2xl">
      {/* Badge Image Upload */}
      <div className="text-center">
        <div className="relative inline-block">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Badge preview"
              className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-yellow-100 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
              <Award className="w-16 h-16 text-yellow-600" />
            </div>
          )}
          
          <label
            htmlFor="badge-upload"
            className="absolute bottom-0 right-0 bg-yellow-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-yellow-700 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            <input
              id="badge-upload"
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
            {previewUrl ? 'Badge image ready' : 'Upload badge image *'}
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, GIF up to 5MB. Square images work best.
          </p>
        </div>
        {errors.imageUrl && (
          <p className="form-error text-center">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="form-label">
          Badge Name *
        </label>
        <div className="relative">
          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('name')}
            type="text"
            className="input-field pl-10"
            placeholder="Enter badge name"
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
          rows={3}
          className="input-field resize-vertical"
          placeholder="Describe what this badge represents..."
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          {watch('description')?.length || 0}/200 characters
        </p>
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      {/* Criteria */}
      <div>
        <label htmlFor="criteria" className="form-label">
          Award Criteria *
        </label>
        <textarea
          {...register('criteria')}
          rows={4}
          className="input-field resize-vertical"
          placeholder="Explain what volunteers need to do to earn this badge..."
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          {watch('criteria')?.length || 0}/500 characters
        </p>
        {errors.criteria && (
          <p className="form-error">{errors.criteria.message}</p>
        )}
      </div>

      {/* Hidden image URL field */}
      <input type="hidden" {...register('imageUrl')} />

      {/* Submit Button */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={loading || uploading || !watch('imageUrl')}
          className="btn-primary flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Creating Badge...' : 'Updating Badge...'}
            </>
          ) : (
            mode === 'create' ? 'Create Badge' : 'Update Badge'
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Creating a Badge</h4>
          <p className="text-sm text-yellow-800">
            Badges are a great way to recognize and reward your volunteers' achievements.
          </p>
          <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
            <li>Choose a meaningful name and description</li>
            <li>Set clear criteria for earning the badge</li>
            <li>Use a high-quality square image</li>
            <li>Badges can be awarded manually by NGO admins</li>
          </ul>
        </div>
      )}
    </form>
  );
};

export default BadgeForm;