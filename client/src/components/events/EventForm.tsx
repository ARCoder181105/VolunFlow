import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Tag, Upload, Loader2, Sparkles } from 'lucide-react';
import type { CreateEventInput, Event } from '../../types/event.types';
import { useMutation } from '@apollo/client/react';
import { GENERATE_EVENT_TAGS_MUTATION } from '../../graphql/mutations/event.mutations';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  maxVolunteers: z.number().min(1, 'Must be at least 1').optional().or(z.literal('')),
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
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  
  interface GenerateTagsResult {
    generateEventTags: string[];
  }

  const [generateTags] = useMutation<GenerateTagsResult>(GENERATE_EVENT_TAGS_MUTATION);

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
      date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event?.location || '',
      maxVolunteers: event?.maxVolunteers || '',
      tags: event?.tags || [],
      imageUrl: event?.imageUrl || '',
    },
  });

  const currentTags = watch('tags');

  useEffect(() => {
    if (event) {
      setValue('tags', event.tags || []);
    }
  }, [event, setValue]);

  const handleAddTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleGenerateTags = async () => {
    const description = watch('description');
    if (!description.trim()) {
      setError('description', { message: 'Please enter a description first' });
      return;
    }

    setIsGeneratingTags(true);
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
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmitForm = (data: EventFormData) => {
    const submitData: CreateEventInput = {
      ...data,
      maxVolunteers: data.maxVolunteers || undefined,
      imageUrl: data.imageUrl || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 max-w-2xl">
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
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('date')}
            type="datetime-local"
            className="input-field pl-10"
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
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('location')}
            type="text"
            className="input-field pl-10"
            placeholder="Enter event location"
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
          {...register('maxVolunteers', { valueAsNumber: true })}
          type="number"
          min="1"
          className="input-field"
          placeholder="Leave empty for unlimited volunteers"
        />
        {errors.maxVolunteers && (
          <p className="mt-1 text-sm text-red-600">{errors.maxVolunteers.message}</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Event Image URL (Optional)
        </label>
        <div className="relative">
          <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('imageUrl')}
            type="url"
            className="input-field pl-10"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <button
            type="button"
            onClick={handleGenerateTags}
            disabled={isGeneratingTags}
            className="flex items-center text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {isGeneratingTags ? 'Generating...' : 'AI Generate Tags'}
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Tag Input */}
          <div className="flex space-x-2">
            <div className="relative grow">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field pl-10"
                placeholder="Add a tag and press Enter"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary whitespace-nowrap"
            >
              Add Tag
            </button>
          </div>

          {/* Current Tags */}
          {currentTags.length > 0 && (
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
                    className="ml-2 text-blue-600 hover:text-blue-800"
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
          disabled={loading}
          className="btn-primary flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Creating Event...' : 'Updating Event...'}
            </>
          ) : (
            mode === 'create' ? 'Create Event' : 'Update Event'
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
    </form>
  );
};

export default EventForm;