import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react'; // FIX: Corrected import path
import { ArrowLeft } from 'lucide-react';
import { GET_EVENT_DETAILS_QUERY } from '../graphql/queries/event.queries';
import { SIGNUP_FOR_EVENT_MUTATION, CANCEL_SIGNUP_MUTATION } from '../graphql/mutations/event.mutations';
import { MY_PROFILE_QUERY } from '../graphql/queries/user.queries';
import type { EventDetailsData } from '../types/event.types'; // Import from types
import type { MyProfileData } from '../types/user.types'; // Import from types
import EventDetails from '../components/events/EventDetails';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Fetch event details using the new query
  const { data: eventData, loading: eventLoading, error: eventError } = useQuery<EventDetailsData>(GET_EVENT_DETAILS_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  // Fetch user profile to check if signed up
  const { data: profileData } = useQuery<MyProfileData>(MY_PROFILE_QUERY);

  const [signupForEvent, { loading: signupLoading }] = useMutation(SIGNUP_FOR_EVENT_MUTATION, {
    refetchQueries: [
      { query: GET_EVENT_DETAILS_QUERY, variables: { eventId } },
      { query: MY_PROFILE_QUERY }
    ],
  });

  const [cancelSignup, { loading: cancelLoading }] = useMutation(CANCEL_SIGNUP_MUTATION, {
    refetchQueries: [
      { query: GET_EVENT_DETAILS_QUERY, variables: { eventId } },
      { query: MY_PROFILE_QUERY }
    ],
  });

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (eventError || !eventData?.getEventDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-4">
            {eventError 
              ? 'There was an error loading the event details.'
              : 'The event you\'re looking for doesn\'t exist or may have been removed.'
            }
          </p>
          <button onClick={() => navigate('/events')} className="btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const event = eventData.getEventDetails;
  // FIX: Added explicit type for 'signup'
  const userSignups = profileData?.myProfile.signups?.map((signup: { event: { id: string } }) => signup.event.id) || [];
  const isUserSignedUp = userSignups.includes(eventId!);
  const volunteerCount = event.signups?.length || 0;

  const handleSignUp = async () => {
    try {
      await signupForEvent({ variables: { eventId } });
    } catch (error) {
      console.error('Error signing up for event:', error);
      alert('Failed to sign up for event');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSignup({ variables: { eventId } });
    } catch (error) {
      console.error('Error canceling signup:', error);
      alert('Failed to cancel signup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </button>

        {/* Event Details */}
        <EventDetails
          event={event}
          isSignedUp={isUserSignedUp}
          volunteerCount={volunteerCount}
          onSignUp={handleSignUp}
          onCancel={handleCancel}
          loading={signupLoading || cancelLoading}
        />
      </div>
    </div>
  );
};

export default EventDetailsPage;