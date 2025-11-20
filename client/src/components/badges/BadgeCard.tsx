import React from 'react';
import { Award, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import type { Badge } from '../../types/badge.types';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedDate?: string;
  showActions?: boolean;
  onAward?: (badgeId: string) => void;
  isAdmin?: boolean; // <--- New Prop
}

const BadgeCard: React.FC<BadgeCardProps> = ({ 
  badge, 
  earned = false, 
  earnedDate, 
  showActions = false,
  onAward,
  isAdmin = false 
}) => {
  // Determine the visual state based on role and status
  const isUnlocked = earned || isAdmin;
  
  // Dynamic classes based on state
  const borderColor = isAdmin 
    ? 'border-blue-200 hover:border-blue-300' 
    : earned 
      ? 'border-yellow-200 shadow-sm ring-1 ring-yellow-100' 
      : 'border-gray-200';

  const hoverEffect = isAdmin 
    ? 'hover:shadow-md'
    : !earned 
      ? 'hover:shadow-lg hover:-translate-y-1' 
      : '';

  return (
    <div 
      className={`
        relative flex flex-col h-full bg-white rounded-2xl border transition-all duration-300 overflow-hidden group
        ${borderColor} ${hoverEffect}
      `}
    >
      {/* Status Indicator (Top Right) */}
      <div className="absolute top-3 right-3 z-10">
        {isAdmin ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Template
          </span>
        ) : earned ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Earned
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </span>
        )}
      </div>

      {/* Image Section */}
      <div className={`
        relative h-40 flex items-center justify-center p-6
        ${isAdmin 
          ? 'bg-linear-to-b from-blue-50 to-white' 
          : earned 
            ? 'bg-linear-to-b from-yellow-50 to-white' 
            : 'bg-linear-to-b from-gray-50 to-white'
        }
      `}>
        <div className={`
          relative w-24 h-24 rounded-full p-1 shadow-sm
          ${isAdmin 
            ? 'bg-blue-100' 
            : earned 
              ? 'bg-yellow-100' 
              : 'bg-white border border-gray-100'
          }
        `}>
          <img
            src={badge.imageUrl}
            alt={badge.name}
            className={`
              w-full h-full rounded-full object-cover
              ${!isUnlocked && 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500'}
            `}
          />
          
          {/* Lock Overlay for non-admins who haven't earned it */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 group-hover:opacity-0 transition-opacity duration-300">
               <Lock className="w-8 h-8 text-gray-400 opacity-50" />
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col grow p-5 text-center pt-0">
        <h3 className={`
          text-lg font-bold mb-2 transition-colors
          ${isAdmin ? 'text-blue-900' : earned ? 'text-gray-900' : 'text-gray-700 group-hover:text-blue-600'}
        `}>
          {badge.name}
        </h3>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {badge.description}
        </p>

        {/* Criteria Box */}
        <div className="mt-auto bg-gray-50 rounded-xl p-3 border border-gray-100 text-left">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
            {isAdmin ? 'Award Criteria' : 'How to earn'}
          </p>
          <p className="text-xs text-gray-600 leading-snug font-medium">
            {badge.criteria}
          </p>
        </div>

        {/* Footer / Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          {isAdmin ? (
             <p className="text-xs font-medium text-blue-600 flex items-center justify-center">
               Managed by your NGO
             </p>
          ) : earned && earnedDate ? (
            <p className="text-xs font-medium text-green-600 flex items-center justify-center">
              <Award className="w-3 h-3 mr-1.5" />
              Unlocked on {new Date(earnedDate).toLocaleDateString()}
            </p>
          ) : showActions && onAward ? (
            <button
              onClick={() => onAward(badge.id)}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Award Badge
            </button>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Keep volunteering to unlock!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;