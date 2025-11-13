import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Users, Calendar, Award, Plus, Building } from 'lucide-react';
import { MY_NGO_QUERY } from '../../graphql/queries/ngo.queries';
import type { MyNgoData } from '../../types/ngo.types';
import type { Event } from '../../types/event.types';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useQuery<MyNgoData>(MY_NGO_QUERY);

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    console.error("AdminDashboard Error:", error);
    return (
      <div className="card text-center bg-red-50 border-red-200">
        <h3 className="text-xl font-semibold text-red-700">Error loading NGO data</h3>
        <p className="text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

  const ngo = data?.myNgo;

  if (!ngo) {
    return (
      <div className="card text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, Admin!
        </h2>
        <p className="text-gray-600 mb-6">
          Your NGO profile isn't set up yet. Create one to start managing events and volunteers.
        </p>
        <Link
          to="/ngo"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Your NGO Profile
        </Link>
      </div>
    );
  }

  const upcomingEvents = ngo.events?.filter((event: Event) => new Date(event.date) > new Date()) || [];
  
  const allSignups = ngo.events?.flatMap((event: Event) => event.signups || []) || [];
  
  const totalVolunteers = new Set(allSignups.map((s: { user: { id: string } }) => s.user.id)).size;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ... (stats divs remain unchanged) ... */}
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {ngo.events?.length || 0}
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
            {ngo.badges?.length || 0}
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
            {/* 3. UPDATE THIS LINK */}
            <Link
              to="/events/create" // <-- CHANGED FROM /events?action=create
              className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition duration-200 hover-raise"
            >
              <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Event</span>
            </Link>

            <Link
              to="/badges/create"
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition duration-200 hover-raise block"
            >
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Badge</span>
            </Link>
            {/* ... (other quick actions) ... */}
            <Link
              to="/dashboard?tab=volunteers"
              className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition duration-200 hover-raise"
            >
              <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Volunteers</span>
            </Link>

            <Link
              to="/dashboard?tab=reports"
              className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition duration-200 hover-raise"
            >
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </Link>
          </div>
        </div>

        {/* ... (rest of the file is unchanged) ... */}
        
        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event: Event) => (
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
                <dd className="text-gray-900">{ngo.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Contact Email</dt>
                <dd className="text-gray-900">{ngo.contactEmail}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Website</dt>
                <dd className="text-gray-900">{ngo.website || 'Not provided'}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{ngo.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;