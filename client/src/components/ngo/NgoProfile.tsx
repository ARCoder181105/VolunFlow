import React, { useState } from 'react';
import { Building, MapPin, Mail, Globe, Calendar, Award, Edit3 } from 'lucide-react';
import type { NGO } from '../../types/ngo.types';
import type { Event } from '../../types/event.types'; // Import main Event type
import EventCard from '../events/EventCard';
import BadgeCard from '../badges/BadgeCard';

interface NgoProfileProps {
  ngo: NGO;
  isAdmin?: boolean;
  onEdit?: () => void;
  userSignups?: string[];
  onEventSignUp?: (eventId: string) => void;
  onEventCancel?: (eventId: string) => void;
}

const NgoProfile: React.FC<NgoProfileProps> = ({
  ngo,
  isAdmin = false,
  onEdit,
  userSignups = [],
  onEventSignUp,
  onEventCancel
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'badges' | 'branches'>('events');

  const upcomingEvents = ngo.events?.filter((event: Event) => { // Use main Event type
    try {
      return new Date(event.date) > new Date();
    } catch {
      return false;
    }
  }) || [];

  const pastEvents = ngo.events?.filter((event: Event) => { // Use main Event type
    try {
      return new Date(event.date) <= new Date();
    } catch {
      return false;
    }
  }) || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start space-x-6 mb-4 lg:mb-0">
            {ngo.logoUrl ? (
              <img
                src={ngo.logoUrl}
                alt={ngo.name}
                className="w-20 h-20 rounded-lg object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                <Building className="w-10 h-10 text-blue-600" />
              </div>
            )}
            
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{ngo.name}</h1>
                {isAdmin && onEdit && (
                  <button
                    onClick={onEdit}
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 text-lg mb-4 max-w-3xl">
                {ngo.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm">{ngo.contactEmail}</span>
                </div>
                
                {ngo.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-2 text-green-600" />
                    <a 
                      href={ngo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:text-green-600 transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                  <span className="text-sm">{ngo.events?.length || 0} Events</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{ngo.events?.length || 0}</div>
              <div className="text-xs text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{ngo.badges?.length || 0}</div>
              <div className="text-xs text-gray-600">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{ngo.branches?.length || 0}</div>
              <div className="text-xs text-gray-600">Branches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Events ({ngo.events?.length || 0})
          </button>
          
          <button
            onClick={() => setActiveTab('badges')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'badges'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Badges ({ngo.badges?.length || 0})
          </button>
          
          <button
            onClick={() => setActiveTab('branches')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branches'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Branches ({ngo.branches?.length || 0})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event} // No cast needed
                      onSignUp={onEventSignUp}
                      onCancel={onEventCancel}
                      userSignups={userSignups}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event} // No cast needed
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {ngo.events?.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Yet</h3>
                <p className="text-gray-600">
                  {isAdmin 
                    ? 'Create your first event to start engaging with volunteers.'
                    : 'This NGO hasn\'t created any events yet.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            {ngo.badges && ngo.badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ngo.badges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Badges Yet</h3>
                <p className="text-gray-600">
                  {isAdmin
                    ? 'Create badge templates to recognize and reward your volunteers.'
                    : 'This NGO hasn\'t created any badges yet.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <div>
            {ngo.branches && ngo.branches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ngo.branches.map((branch) => (
                  <div key={branch.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{branch.city}</h3>
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-gray-600 mb-2">{branch.address}</p>
                    <div className="text-sm text-gray-500">
                      Coordinates: {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Branches Listed</h3>
                <p className="text-gray-600">
                  {isAdmin
                    ? 'Add branch locations to help volunteers find your NGO.'
                    : 'This NGO hasn\'t listed any branch locations yet.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NgoProfile;