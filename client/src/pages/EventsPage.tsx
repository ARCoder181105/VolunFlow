import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Search,  } from 'lucide-react';
import { GET_ALL_EVENTS_QUERY } from '../graphql/queries/event.queries';
import { SIGNUP_FOR_EVENT_MUTATION, CANCEL_SIGNUP_MUTATION } from '../graphql/mutations/event.mutations';
import { MY_PROFILE_QUERY } from '../graphql/queries/user.queries';
import type { Event } from '../types/event.types';
import EventList from '../components/events/EventList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: eventsData, loading: eventsLoading } = useQuery<{ getAllEvents: Event[] }>(GET_ALL_EVENTS_QUERY);
  const { data: profileData } = useQuery<{ myProfile: { signups: Array<{ event: { id: string } }> } }>(MY_PROFILE_QUERY);
  
  const [signupForEvent] = useMutation(SIGNUP_FOR_EVENT_MUTATION, {
    refetchQueries: [GET_ALL_EVENTS_QUERY, MY_PROFILE_QUERY],
  });

  const [cancelSignup] = useMutation(CANCEL_SIGNUP_MUTATION, {
    refetchQueries: [GET_ALL_EVENTS_QUERY, MY_PROFILE_QUERY],
  });

  const userSignups = profileData?.myProfile.signups.map(signup => signup.event.id) || [];

  const handleSignUp = async (eventId: string) => {
    try {
      await signupForEvent({ variables: { eventId } });
    } catch (error) {
      console.error('Error signing up for event:', error);
      alert('Failed to sign up for event');
    }
  };

  const handleCancel = async (eventId: string) => {
    try {
      await cancelSignup({ variables: { eventId } });
    } catch (error) {
      console.error('Error canceling signup:', error);
      alert('Failed to cancel signup');
    }
  };

  // Filter events based on search and tags
  const filteredEvents = eventsData?.getAllEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => event.tags.includes(tag));
    return matchesSearch && matchesTags;
  }) || [];

  // Get all unique tags
  const allTags = Array.from(new Set(eventsData?.getAllEvents.flatMap(event => event.tags) || []));

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteering Events</h1>
          <p className="text-gray-600">Discover opportunities to make a difference in your community</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Events List */}
        <EventList
          events={filteredEvents}
          onSignUp={handleSignUp}
          onCancel={handleCancel}
          userSignups={userSignups}
        />
      </div>
    </div>
  );
};

export default EventsPage;