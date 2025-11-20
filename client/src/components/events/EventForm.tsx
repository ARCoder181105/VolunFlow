import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Tag, Upload, Loader2, Sparkles, Image } from 'lucide-react';
import type { CreateEventInput, Event } from '../../types/event.types';
import { useMutation } from '@apollo/client/react';
import { GENERATE_EVENT_TAGS_MUTATION } from '../../graphql/mutations/event.mutations';

// --- SCHEMA DEFINITION ---
// validation logic works on strings directly to avoid type conflicts with the form hook
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  date: z.string()
    .min(1, 'Date is required')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please select a valid date and time",
    }),
  location: z.string().min(1, 'Location is required'),
  // Fix: Validate as string (allowing empty), convert later
  maxVolunteers: z.string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 1), { 
      message: "Must be at least 1" 
    }),
  tags: z.array(z.string()),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  onSubmit: (data: CreateEventInput) => Promise<void>;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  loading = false,
  mode = 'create'
}) => {
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(event?.imageUrl || '');

  // Mutation for AI tags
  interface GenerateTagsResult {
    generateEventTags: string[];
  }
  const [generateTags, { loading: isGeneratingTags }] = useMutation<GenerateTagsResult>(GENERATE_EVENT_TAGS_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event?.location || '',
      // Convert number to string for the input field
      maxVolunteers: event?.maxVolunteers ? String(event.maxVolunteers) : '',
      tags: event?.tags || [],
      imageUrl: event?.imageUrl || '',
    },
  });

  const currentTags = watch('tags');

  // Update tags if event prop changes (e.g. when editing)
  useEffect(() => {
    if (event) {
      setValue('tags', event.tags || []);
      if (event.imageUrl) setPreviewUrl(event.imageUrl);
    }
  }, [event, setValue]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

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

  const handleAddTag = () => {
    if (tagInput.trim() && !currentTags?.includes(tagInput.trim())) {
      const newTags = currentTags ? [...currentTags, tagInput.trim()] : [tagInput.trim()];
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags?.filter(tag => tag !== tagToRemove) || [];
    setValue('tags', newTags);
  };

  const handleGenerateTags = async () => {
    const description = watch('description');
    if (!description?.trim()) {
      setError('description', { message: 'Please enter a description first' });
      return;
    }

    try {
      const { data } = await generateTags({
        variables: { description: description.trim() }
      });
      
      if (data?.generateEventTags) {
        setValue('tags', data.generateEventTags);
        clearErrors('tags');
      }
    } catch (error) {
      console.error('Failed to generate tags:', error);
      setError('tags', { message: 'Failed to generate tags. Please try again.' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmitForm = (data: EventFormData) => {
    // Manual conversion happens here, avoiding the type conflict in useForm
    const submitData: CreateEventInput = {
      ...data,
      // Convert local time string back to ISO string for backend
      date: new Date(data.date).toISOString(),
      // Convert string input to number or undefined
      maxVolunteers: data.maxVolunteers === '' ? undefined : Number(data.maxVolunteers),
      imageUrl: data.imageUrl || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 max-w-2xl">
      {/* Event Image Upload */}
      <div className="text-center">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Image (Optional)
        </label>
        
        <div className="relative inline-block w-full max-w-sm group cursor-pointer">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Event preview"
              className="w-full aspect-video rounded-lg object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div 
              className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-4 border-white shadow-lg hover:bg-gray-200 transition-colors"
            >
              <Image className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          <label
            htmlFor="image-upload"
            className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading || loading}
            />
          </label>
        </div>
        
        {errors.imageUrl && (
          <p className="form-error text-center mt-2 text-sm text-red-600">{errors.imageUrl.message}</p>
        )}
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            JPG, PNG, GIF up to 5MB. Recommended: 16:9 aspect ratio.
          </p>
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Event Title *
        </label>
        <input
          {...register('title')}
          type="text"
          className="input-field"
          placeholder="Enter event title"
          disabled={loading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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
          placeholder="Describe the event, what volunteers will be doing, and any important details..."
          disabled={loading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Date & Time */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            {...register('date')}
            type="datetime-local"
            className="input-field pl-10"
            disabled={loading}
          />
        </div>
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            {...register('location')}
            type="text"
            className="input-field pl-10"
            placeholder="Enter event location"
            disabled={loading}
          />
        </div>
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Max Volunteers */}
      <div>
        <label htmlFor="maxVolunteers" className="block text-sm font-medium text-gray-700 mb-1">
          Maximum Volunteers (Optional)
        </label>
        <input
          {...register('maxVolunteers')} 
          type="number"
          min="1"
          className="input-field"
          placeholder="Leave empty for unlimited volunteers"
          disabled={loading}
        />
        {errors.maxVolunteers && (
          <p className="mt-1 text-sm text-red-600">{errors.maxVolunteers.message}</p>
        )}
      </div>
      
      {/* Hidden imageUrl field managed by state */}
      <input type="hidden" {...register('imageUrl')} />

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <button
            type="button"
            onClick={handleGenerateTags}
            disabled={isGeneratingTags || loading}
            className="flex items-center text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {isGeneratingTags ? 'Generating...' : 'AI Generate Tags'}
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="relative grow">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field pl-10"
                placeholder="Add a tag and press Enter"
                disabled={loading}
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary whitespace-nowrap"
              disabled={loading}
            >
              Add Tag
            </button>
          </div>

          {currentTags && currentTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold focus:outline-none"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-primary flex items-center justify-center flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Creating Event...' : 'Updating Event...'}
            </>
          ) : uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading Image...
            </>
          ) : (
            mode === 'create' ? 'Create Event' : 'Update Event'
          )}
        </button>
        
        <button
          type="button"
          className="btn-secondary flex-1"
          onClick={() => window.history.back()}
          disabled={loading || uploading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EventForm;