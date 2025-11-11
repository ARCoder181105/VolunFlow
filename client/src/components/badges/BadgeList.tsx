import React, { useState } from 'react';
import { Search, Filter, Grid, List, Award } from 'lucide-react';
import type { Badge, EarnedBadge } from '../../types/badge.types';
import BadgeCard from './BadgeCard';

interface BadgeListProps {
  badges: (Badge & { earned?: boolean; earnedDate?: string })[];
  earnedBadges?: EarnedBadge[];
  showActions?: boolean;
  onAward?: (badgeId: string) => void;
  loading?: boolean;
}

const BadgeList: React.FC<BadgeListProps> = ({ 
  badges, 
  earnedBadges = [], 
  showActions = false,
  onAward,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'earned' | 'unearned'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Create a map of earned badges for quick lookup
  const earnedBadgesMap = new Map(
    earnedBadges.map(eb => [eb.badge.id, eb.awardedAt])
  );

  // Enhance badges with earned status
  const enhancedBadges = badges.map(badge => ({
    ...badge,
    earned: earnedBadgesMap.has(badge.id),
    earnedDate: earnedBadgesMap.get(badge.id)
  }));

  // Filter badges based on search and filter
  const filteredBadges = enhancedBadges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'earned' && badge.earned) ||
      (filter === 'unearned' && !badge.earned);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }`}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className={`card animate-pulse ${
            viewMode === 'list' ? 'flex items-center space-x-4' : ''
          }`}>
            {viewMode === 'list' ? (
              <>
                <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="grow space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (filteredBadges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges found</h3>
        <p className="text-gray-600">
          {searchTerm || filter !== 'all' 
            ? 'Try adjusting your search or filter criteria.'
            : 'No badges available at the moment.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search */}
        <div className="relative grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'earned' | 'unearned')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Badges</option>
              <option value="earned">Earned</option>
              <option value="unearned">Not Earned</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Badges */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={badge.earned}
              earnedDate={badge.earnedDate}
              showActions={showActions}
              onAward={onAward}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBadges.map((badge) => (
            <div key={badge.id} className="card flex items-start space-x-4 hover:shadow-lg transition-shadow duration-300">
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{badge.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{badge.description}</p>
                  </div>
                  {badge.earned && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      Earned
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700 font-medium mb-1">Criteria:</p>
                  <p className="text-xs text-gray-600">{badge.criteria}</p>
                </div>
                {badge.earned && badge.earnedDate && (
                  <p className="text-xs text-green-600 font-medium mt-2">
                    Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                  </p>
                )}
                {showActions && !badge.earned && onAward && (
                  <button
                    onClick={() => onAward(badge.id)}
                    className="mt-3 btn-primary text-sm py-1 px-3"
                  >
                    Award Badge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeList;