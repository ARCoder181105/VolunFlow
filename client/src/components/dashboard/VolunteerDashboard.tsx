import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Calendar, Award, TrendingUp } from 'lucide-react';
import { MY_PROFILE_QUERY } from '../../graphql/queries/user.queries';
import type { UserProfile } from '../../types/user.types';
import LoadingSpinner from '../common/LoadingSpinner';
// import EventCard from '../events/EventCard';

const VolunteerDashboard: React.FC = () => {
  const { data, loading, error } = useQuery<{ myProfile: UserProfile }>(MY_PROFILE_QUERY);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading dashboard</div>;

  const profile = data?.myProfile;
  const upcomingEvents = profile?.signups?.filter(signup => 
    new Date(signup.event.date) > new Date() && signup.status === 'CONFIRMED'
  ) || [];

  const earnedBadges = profile?.earnedBadges || [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {profile?.signups?.length || 0}
          </h3>
          <p className="text-gray-600">Total Events</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {upcomingEvents.length}
          </h3>
          <p className="text-gray-600">Upcoming Events</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {earnedBadges.length}
          </h3>
          <p className="text-gray-600">Badges Earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map((signup) => (
                <div key={signup.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="grow">
                    <h4 className="font-medium text-gray-900">{signup.event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(signup.event.date).toLocaleDateString()} • {signup.event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No upcoming events</p>
          )}
        </div>

        {/* Recent Badges */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Badges</h2>
          {earnedBadges.length > 0 ? (
            <div className="space-y-4">
              {earnedBadges.slice(0, 3).map((earnedBadge) => (
                <div key={earnedBadge.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={earnedBadge.badge.imageUrl}
                    alt={earnedBadge.badge.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="grow">
                    <h4 className="font-medium text-gray-900">{earnedBadge.badge.name}</h4>
                    <p className="text-sm text-gray-600">
                      Earned on {new Date(earnedBadge.awardedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No badges earned yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;