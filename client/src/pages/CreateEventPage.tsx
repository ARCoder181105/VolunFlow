import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { CREATE_EVENT_MUTATION } from '../graphql/mutations/event.mutations';
import { MY_NGO_QUERY } from '../graphql/queries/ngo.queries';
import EventForm from '../components/events/EventForm';
import { useAuth } from '../hooks/useAuth';
import type { CreateEventInput } from '../types/event.types';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [createEvent, { loading }] = useMutation(CREATE_EVENT_MUTATION, {
    refetchQueries: [MY_NGO_QUERY], // Refetch NGO data to show new event
    onCompleted: () => {
      navigate('/ngo?view=my-ngo'); // Go back to "My NGO" page
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleCreateEvent = async (input: CreateEventInput) => {
    try {
      await createEvent({ variables: { input } });
    } catch (error) {
      // Error is handled by the 'onError' property in useMutation
    }
  };

  // Only NGO Admins can create events
  if (user?.role !== 'NGO_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only NGO administrators can create events.</p>
          <button onClick={() => navigate('/events')} className="btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/ngo?view=my-ngo')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My NGO
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
              </div>
              <p className="text-gray-600">
                Fill out the details below to schedule your new event and start recruiting volunteers.
              </p>
            </div>
            
            <EventForm
              onSubmit={handleCreateEvent}
              loading={loading}
              mode="create"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;