import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Mail, Globe, Upload, Loader2 } from 'lucide-react';
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
  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const logoUrl = watch('logoUrl');

  const onSubmitForm = (data: NgoFormData) => {
    const submitData: CreateNgoInput = {
      name: data.name,
      description: data.description,
      contactEmail: data.contactEmail,
      ...(data.logoUrl && { logoUrl: data.logoUrl }),
      ...(data.website && { website: data.website }),
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 max-w-2xl">
      {/* Logo Preview */}
      {(logoUrl || ngo?.logoUrl) && (
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-white shadow-lg">
            <img
              src={logoUrl || ngo?.logoUrl}
              alt="NGO Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          NGO Name *
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('name')}
            type="text"
            className="input-field pl-10"
            placeholder="Enter NGO name"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="input-field resize-vertical"
          placeholder="Describe your NGO's mission, values, and the impact you make..."
        />
        <p className="mt-1 text-sm text-gray-500">
          {watch('description')?.length || 0}/500 characters
        </p>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Contact Email */}
      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Contact Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('contactEmail')}
            type="email"
            className="input-field pl-10"
            placeholder="contact@example.org"
          />
        </div>
        {errors.contactEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
        )}
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
          Website (Optional)
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('website')}
            type="url"
            className="input-field pl-10"
            placeholder="https://example.org"
          />
        </div>
        {errors.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
        )}
      </div>

      {/* Logo URL */}
      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Logo URL (Optional)
        </label>
        <div className="relative">
          <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('logoUrl')}
            type="url"
            className="input-field pl-10"
            placeholder="https://example.org/logo.jpg"
          />
        </div>
        {errors.logoUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.logoUrl.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Paste a direct link to your NGO's logo image
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={loading}
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