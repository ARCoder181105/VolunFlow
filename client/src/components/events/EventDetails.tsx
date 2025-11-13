import React from 'react';
import { Calendar, MapPin, Users, Clock, Building, Tag } from 'lucide-react';
import type { Event } from '../../types/event.types';
import { format, isValid } from 'date-fns'; // 1. Import 'isValid'

interface EventDetailsProps {
  event: Event;
  isSignedUp?: boolean;
  volunteerCount?: number;
  onSignUp?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  isSignedUp = false,
  volunteerCount = 0,
  onSignUp,
  onCancel,
  loading = false
}) => {
  // 2. Create and validate the date
  const eventDate = new Date(event.date);
  const isDateValid = isValid(eventDate);

  // 3. Only check if it's in the past if the date is valid
  const isPastEvent = isDateValid ? eventDate < new Date() : false;
  const isFull = !!event.maxVolunteers && volunteerCount >= event.maxVolunteers;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="card mb-6">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-64 object-cover rounded-t-lg mb-6"
          />
        )}
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="grow">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  {/* 4. Conditionally render the date or a fallback */}
                  {isDateValid ? (
                    <>
                      <p className="font-medium">{format(eventDate, 'EEEE, MMMM do, yyyy')}</p>
                      <p className="text-sm">{format(eventDate, 'h:mm a')}</p>
                    </>
                  ) : (
                    <p className="font-medium text-red-600">Invalid Date</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-green-600" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3 text-purple-600" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-sm">4 hours (estimated)</p>
                </div>
              </div>
              
              {event.maxVolunteers && (
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-orange-600" />
                  <div>
                    <p className="font-medium">Volunteers</p>
                    <p className="text-sm">
                      {volunteerCount} / {event.maxVolunteers} registered
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Button */}
          {/* 5. Add 'isDateValid' check to the button logic */}
          {!isPastEvent && isDateValid && (
            <div className="lg:pl-6 lg:border-l lg:border-gray-200">
              {isSignedUp ? (
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="w-full lg:w-auto btn-secondary text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50"
                >
                  {loading ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              ) : (
                <button
                  onClick={onSignUp}
                  disabled={loading || isFull}
                  className="w-full lg:w-auto btn-primary disabled:opacity-50"
                >
                  {loading ? 'Signing Up...' : isFull ? 'Event Full' : 'Sign Up Now'}
                </button>
              )}
              
              {isFull && !isSignedUp && (
                <p className="text-sm text-orange-600 mt-2 text-center lg:text-left">
                  This event has reached maximum capacity
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rest of the component... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* What to Bring */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What to Bring</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Comfortable clothing and closed-toe shoes</li>
              <li>Water bottle to stay hydrated</li>
              <li>Sun protection (hat, sunscreen)</li>
              <li>Positive attitude and willingness to help!</li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* NGO Info */}
          {event.ngo && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Hosted By
              </h2>
              <div className="flex items-center space-x-3">
                {event.ngo.logoUrl && (
                  <img
                    src={event.ngo.logoUrl}
                    alt={event.ngo.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{event.ngo.name}</h3>
                  <p className="text-sm text-gray-600">Non-profit Organization</p>
                </div>
              </div>
            </div>
          )}

          {/* Event Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-green-600" />
                Event Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Please arrive 15 minutes early</li>
              <li>• Check the weather forecast and dress appropriately</li>
              <li>• Contact the organizer if you have any questions</li>
              <li>• Let us know if you can no longer attend</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;