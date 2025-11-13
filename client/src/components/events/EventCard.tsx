import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { Event } from '../../types/event.types';
import { format, isValid } from 'date-fns'; // 1. Import 'isValid'
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
  onSignUp?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
  userSignups?: string[];
  showActions?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onSignUp, 
  onCancel, 
  userSignups = [], 
  showActions = true 
}) => {
  const isSignedUp = userSignups.includes(event.id);

  // 2. Create the date object AND validate it
  const eventDate = new Date(event.date);
  const isDateValid = isValid(eventDate);
  
  // 3. Only check if it's in the past if the date is valid
  const isPastEvent = isDateValid ? eventDate < new Date() : false;

  // Safe handling for tags - use empty array if undefined
  const eventTags = event.tags || [];

  return (
    <div className="card hover:shadow-lg transition-all duration-300 hover-raise group">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover rounded-t-lg mb-4 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}
      
      <div className="flex flex-col h-full">
        <div className="grow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            <Link 
              to={`/events/${event.id}`}
              className="hover:text-blue-600 transition-colors link-underline"
            >
              {event.title}
            </Link>
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {event.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {/* 4. Conditionally render the date or a fallback */}
                {isDateValid
                  ? format(eventDate, 'MMM dd, yyyy • hh:mm a')
                  : 'Date not specified'}
              </span>
            </div>
            
            <div className="flex items-center text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{event.location}</span>
            </div>

            {event.maxVolunteers && (
              <div className="flex items-center text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {event.maxVolunteers} volunteers max
                </span>
              </div>
            )}
          </div>

          {eventTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {eventTags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-colors text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 5. Add 'isDateValid' to the conditional checks */}
        {showActions && !isPastEvent && isDateValid && (
          <div className="mt-4">
            {isSignedUp ? (
              <button
                onClick={() => onCancel?.(event.id)}
                className="w-full btn-secondary text-red-600 border-red-300 hover:bg-red-50 hover-raise"
              >
                Cancel Registration
              </button>
            ) : (
              <button
                onClick={() => onSignUp?.(event.id)}
                className="w-full btn-primary hover-raise"
              >
                Sign Up
              </button>
            )}
          </div>
        )}

        {isPastEvent && isDateValid && (
          <div className="mt-4">
            <span className="inline-block w-full text-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
              Event Completed
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;