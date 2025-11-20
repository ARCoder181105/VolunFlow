import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, MapPin, Users, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { GENERATE_EVENT_TAGS_MUTATION } from '../../graphql/mutations/event.mutations';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  maxVolunteers: z.number().min(1).optional().or(z.literal('')),
  tags: z.array(z.string()),
  imageUrl: z.string().optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

// FIX: Define the interface for the mutation response
interface GenerateTagsData {
  generateEventTags: string[];
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // FIX: Pass the interface to useMutation so 'data' is typed correctly
  const [generateTags, { loading: isGeneratingTags }] = useMutation<GenerateTagsData>(GENERATE_EVENT_TAGS_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
    clearErrors
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      tags: [],
      imageUrl: ''
    }
  });

  const currentTags = watch('tags') || [];

  const handleClose = () => {
    reset();
    setPreviewUrl('');
    setTagInput('');
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
      const data = await response.json();
      setValue('imageUrl', data.url);
      setPreviewUrl(data.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleGenerateTags = async () => {
    const description = watch('description');
    if (!description?.trim()) {
      setError('description', { message: 'Enter a description first' });
      return;
    }
    try {
      const { data } = await generateTags({ variables: { description } });
      // Now TypeScript knows 'data' has 'generateEventTags'
      if (data?.generateEventTags) {
        setValue('tags', data.generateEventTags);
        clearErrors('tags');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = async (data: EventFormData) => {
    // Format data for mutation
    const submitData = {
      ...data,
      date: new Date(data.date).toISOString(),
      maxVolunteers: data.maxVolunteers ? Number(data.maxVolunteers) : undefined,
      imageUrl: data.imageUrl || undefined,
    };
    await onSubmit(submitData);
    handleClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            Create New Event
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            
            {/* Image Upload */}
            <div className="flex justify-center mb-4">
               <div className="relative group cursor-pointer w-full max-w-sm aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors flex flex-col items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">Click to upload event image</span>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  )}
               </div>
               <input type="hidden" {...register('imageUrl')} />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title *</label>
              <input {...register('title')} type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors" placeholder="e.g. Community Beach Cleanup" disabled={loading} />
              {errors.title && <p className="mt-1.5 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea {...register('description')} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors" placeholder="Describe the event..." disabled={loading} />
              {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time *</label>
                <div className="relative">
                    <input {...register('date')} type="datetime-local" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors" disabled={loading} />
                </div>
                {errors.date && <p className="mt-1.5 text-sm text-red-600">{errors.date.message}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin className="w-4 h-4" /></div>
                    <input {...register('location')} type="text" className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors" placeholder="e.g. Central Park" disabled={loading} />
                </div>
                {errors.location && <p className="mt-1.5 text-sm text-red-600">{errors.location.message}</p>}
              </div>
            </div>

            {/* Max Volunteers */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Volunteers</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Users className="w-4 h-4" /></div>
                  <input {...register('maxVolunteers')} type="number" className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors" placeholder="Leave empty for unlimited" disabled={loading} />
               </div>
            </div>

            {/* Tags */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
               <div className="flex items-center justify-between mb-2">
                 <label className="text-sm font-medium text-gray-700">Tags</label>
                 <button type="button" onClick={handleGenerateTags} disabled={isGeneratingTags} className="text-xs flex items-center text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50">
                    <Sparkles className="w-3 h-3 mr-1" /> 
                    {isGeneratingTags ? 'Generating...' : 'AI Suggest Tags'}
                 </button>
               </div>
               <div className="flex gap-2 mb-2">
                 <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500" placeholder="Add a tag..." disabled={loading} />
                 <button type="button" onClick={handleAddTag} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Add</button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {currentTags.map((tag, i) => (
                   <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-medium">
                     {tag}
                     <button type="button" onClick={() => setValue('tags', currentTags.filter(t => t !== tag))} className="ml-1 hover:text-purple-900">×</button>
                   </span>
                 ))}
               </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled={loading || uploading}>Cancel</button>
            <button type="submit" disabled={loading || uploading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 min-w-[120px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddEventModal;