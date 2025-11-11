import React from 'react';
import { Award, Star } from 'lucide-react';
import type { Badge } from '../../types/badge.types';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedDate?: string;
  showActions?: boolean;
  onAward?: (badgeId: string) => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ 
  badge, 
  earned = false, 
  earnedDate, 
  showActions = false,
  onAward 
}) => {
  return (
    <div className={`card relative overflow-hidden transition-all duration-300 ${
      earned ? 'ring-2 ring-yellow-400' : 'hover:shadow-lg'
    }`}>
      {/* Earned Badge Indicator */}
      {earned && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Earned
          </div>
        </div>
      )}

      {/* Badge Image */}
      <div className="relative mb-4">
        <img
          src={badge.imageUrl}
          alt={badge.name}
          className="w-24 h-24 mx-auto rounded-lg object-cover"
        />
        {!earned && (
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
            <Award className="w-8 h-8 text-white opacity-80" />
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {badge.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {badge.description}
        </p>
        
        {/* Criteria */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-700 font-medium mb-1">Criteria:</p>
          <p className="text-xs text-gray-600">{badge.criteria}</p>
        </div>

        {/* Earned Date */}
        {earned && earnedDate && (
          <p className="text-xs text-green-600 font-medium mb-3">
            Earned on {new Date(earnedDate).toLocaleDateString()}
          </p>
        )}

        {/* Action Button */}
        {showActions && !earned && onAward && (
          <button
            onClick={() => onAward(badge.id)}
            className="w-full btn-primary text-sm py-2"
          >
            Award Badge
          </button>
        )}

        {!earned && !showActions && (
          <div className="text-xs text-gray-500 italic">
            Not yet earned
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeCard;