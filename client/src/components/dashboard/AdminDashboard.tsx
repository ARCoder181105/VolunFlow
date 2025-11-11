import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Users, Calendar, Award, Plus } from 'lucide-react';
import { MY_NGO_QUERY } from '../../graphql/queries/ngo.queries';
import type { NGO } from '../../types/ngo.types';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useQuery<{ myNgo: NGO }>(MY_NGO_QUERY);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading NGO data</div>;

  const ngo = data?.myNgo;
  const upcomingEvents = ngo?.events?.filter(event => new Date(event.date) > new Date()) || [];
  const totalVolunteers = new Set(ngo?.events?.flatMap(event => event.signups?.map(s => s.userId) || [])).size;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {ngo?.events?.length || 0}
          </h3>
          <p className="text-gray-600">Total Events</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {totalVolunteers}
          </h3>
          <p className="text-gray-600">Unique Volunteers</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {ngo?.badges?.length || 0}
          </h3>
          <p className="text-gray-600">Badge Templates</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {upcomingEvents.length}
          </h3>
          <p className="text-gray-600">Upcoming Events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/events/create"
              className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition duration-200"
            >
              <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Event</span>
            </Link>

            // Replace the Create Badge button with a Link
            <Link
              to="/badges/create"
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition duration-200 block"
            >
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Badge</span>
            </Link>

            <button className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition duration-200">
              <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Volunteers</span>
            </button>

            <button className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition duration-200">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()} • {event.location}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Upcoming
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No upcoming events</p>
          )}
        </div>
      </div>

      {/* NGO Info */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">NGO Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Basic Info</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Name</dt>
                <dd className="text-gray-900">{ngo?.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Contact Email</dt>
                <dd className="text-gray-900">{ngo?.contactEmail}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Website</dt>
                <dd className="text-gray-900">{ngo?.website || 'Not provided'}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{ngo?.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;