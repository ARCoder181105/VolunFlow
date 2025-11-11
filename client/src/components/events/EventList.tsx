import React from 'react';
import type { Event } from '../../types/event.types';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  onSignUp?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
  userSignups?: string[];
  loading?: boolean;
}

const EventList: React.FC<EventListProps> = ({ 
  events, 
  onSignUp, 
  onCancel, 
  userSignups = [], 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-t-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📅</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
        <p className="text-gray-600">Check back later for new volunteering opportunities.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onSignUp={onSignUp}
          onCancel={onCancel}
          userSignups={userSignups}
        />
      ))}
    </div>
  );
};

export default EventList;