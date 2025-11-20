import React from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, MapPin, Loader2, ExternalLink } from 'lucide-react';

// Validation Schema
const branchSchema = z.object({
  city: z.string().min(1, 'City is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  latitude: z.number({ message: 'Must be a number' }).min(-90).max(90),
  longitude: z.number({ message: 'Must be a number' }).min(-180).max(180),
});

export type BranchFormData = z.infer<typeof branchSchema>;

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BranchFormData) => Promise<void>;
  loading?: boolean;
}

const AddBranchModal: React.FC<AddBranchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch // Import watch to track input values
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      city: '',
      address: '',
      latitude: 0,
      longitude: 0
    }
  });

  // Watch city and address to generate the Google Maps link dynamically
  const watchedCity = watch('city');
  const watchedAddress = watch('address');
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${watchedAddress || ''} ${watchedCity || ''}`.trim() || 'map'
  )}`;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: BranchFormData) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto">
      
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
            Add New Branch
          </h3>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="px-6 py-6 space-y-5">
            {/* City Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input
                {...register('city')}
                type="text"
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                  errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                }`}
                placeholder="e.g. San Francisco"
                disabled={loading}
              />
              {errors.city && <p className="mt-1.5 text-sm text-red-600">{errors.city.message}</p>}
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address</label>
              <textarea
                {...register('address')}
                rows={2}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                  errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                }`}
                placeholder="123 Charity Lane, Suite 100"
                disabled={loading}
              />
              {errors.address && <p className="mt-1.5 text-sm text-red-600">{errors.address.message}</p>}
            </div>

            {/* Helper Box for Google Maps */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 space-y-2">
               <div className="flex items-center justify-between">
                 <span className="font-medium flex items-center gap-2">
                   <MapPin className="w-4 h-4" />
                   Get Coordinates
                 </span>
                 <a 
                   href={googleMapsUrl}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-blue-600 hover:text-blue-800 underline text-xs flex items-center gap-1 font-medium"
                 >
                   Open Google Maps <ExternalLink className="w-3 h-3" />
                 </a>
               </div>
               <ol className="list-decimal list-inside text-xs text-blue-700 space-y-1 ml-1">
                 <li>Click the link above to search your address.</li>
                 <li><strong>Right-click</strong> the red location pin on the map.</li>
                 <li>Click the coordinates (first item) to copy them.</li>
                 <li>Paste them into the fields below.</li>
               </ol>
            </div>

            {/* Coordinates Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
                <input
                  {...register('latitude', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                     errors.latitude ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                  }`}
                  placeholder="0.000000"
                  disabled={loading}
                />
                {errors.latitude && <p className="mt-1.5 text-sm text-red-600">{errors.latitude.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
                <input
                  {...register('longitude', { valueAsNumber: true })}
                  type="number"
                  step="any"
                   className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                     errors.longitude ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                  }`}
                  placeholder="0.000000"
                  disabled={loading}
                />
                {errors.longitude && <p className="mt-1.5 text-sm text-red-600">{errors.longitude.message}</p>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add Branch'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddBranchModal;