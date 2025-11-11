import React from 'react';
import { Building, MapPin, Users, Calendar, ExternalLink } from 'lucide-react';
import type { NGO, NgoEvent } from '../../types/ngo.types';
import { Link } from 'react-router-dom';

interface NgoCardProps {
  ngo: NGO;
  showActions?: boolean;
  onViewDetails?: (ngoId: string) => void;
}

const NgoCard: React.FC<NgoCardProps> = ({ ngo, showActions = true,  }) => {
  // Safe filtering with proper type checking
  const upcomingEvents = ngo.events?.filter((event: NgoEvent) => {
    try {
      return new Date(event.date) > new Date();
    } catch {
      return false;
    }
  }) || [];

  const totalEvents = ngo.events?.length || 0;

  return (
    <div className="card hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        {ngo.logoUrl ? (
          <img
            src={ngo.logoUrl}
            alt={ngo.name}
            className="w-16 h-16 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        )}
        
        <div className="grow min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
            {ngo.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {ngo.description}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-green-600" />
          <span>{ngo.branches?.[0]?.city || 'Multiple locations'}</span>
        </div>
        
        {ngo.website && (
          <div className="flex items-center text-sm text-gray-600">
            <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
            <a 
              href={ngo.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              Visit Website
            </a>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{totalEvents}</div>
          <div className="text-xs text-gray-600">Total Events</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center text-gray-600 mb-1">
            <Users className="w-4 h-4 mr-1" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{upcomingEvents.length}</div>
          <div className="text-xs text-gray-600">Upcoming</div>
        </div>
      </div>

      {/* Badges Preview */}
      {ngo.badges && ngo.badges.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Featured Badges</h4>
          <div className="flex space-x-2">
            {ngo.badges.slice(0, 3).map((badge) => (
              <img
                key={badge.id}
                src={badge.imageUrl}
                alt={badge.name}
                className="w-8 h-8 rounded-lg object-cover border-2 border-white shadow-sm"
                title={badge.name}
              />
            ))}
            {ngo.badges.length > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-600 font-medium">
                +{ngo.badges.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2">
          <Link
            to={`/ngo/${ngo.slug}`}
            className="flex-1 btn-primary text-center text-sm py-2"
          >
            View Details
          </Link>
          <Link
            to={`/events?ngo=${ngo.id}`}
            className="flex-1 btn-secondary text-center text-sm py-2"
          >
            View Events
          </Link>
        </div>
      )}
    </div>
  );
};

export default NgoCard;