import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Users, Calendar, Award, Plus, Building, ArrowLeft, TrendingUp, Mail, Settings } from 'lucide-react';
import { MY_NGO_QUERY } from '../../graphql/queries/ngo.queries';
import type { MyNgoData } from '../../types/ngo.types';
import type { Event } from '../../types/event.types';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link, useSearchParams } from 'react-router-dom';
import { isValid, format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useQuery<MyNgoData>(MY_NGO_QUERY);
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

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

  const upcomingEvents = ngo.events?.filter((event: Event) => {
    const eventDate = new Date(event.date);
    return isValid(eventDate) && eventDate > new Date();
  }) || [];
  
  const allSignups = ngo.events?.flatMap((event: Event) => {
    return (event.signups || []).map(s => ({ ...s, eventTitle: event.title, eventDate: event.date }));
  }) || [];
  
  // Extract unique volunteers
  const volunteersMap = new Map();
  allSignups.forEach((s: any) => {
    if (s.user && !volunteersMap.has(s.user.id)) {
      volunteersMap.set(s.user.id, {
        ...s.user,
        joinedAt: s.createdAt, // fallback if needed
        totalEvents: 0
      });
    }
    if (s.user && s.status === 'CONFIRMED') {
        const v = volunteersMap.get(s.user.id);
        v.totalEvents += 1;
    }
  });
  const uniqueVolunteers = Array.from(volunteersMap.values());

  // --- RENDER: VOLUNTEERS TAB ---
  if (currentTab === 'volunteers') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Link to="/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            Manage Volunteers
          </h1>
          <div className="text-sm text-gray-500">
            Total: {uniqueVolunteers.length}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events Attended</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uniqueVolunteers.map((volunteer: any) => (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                          {volunteer.avatarUrl ? (
                            <img src={volunteer.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            volunteer.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {volunteer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {volunteer.totalEvents} Events
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900" onClick={() => alert('Email feature coming soon!')}>Email</button>
                    </td>
                  </tr>
                ))}
                {uniqueVolunteers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No volunteers have signed up for your events yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: REPORTS TAB ---
  if (currentTab === 'reports') {
    const totalEvents = ngo.events?.length || 0;
    const totalSignupsCount = allSignups.length;
    const avgVolunteers = totalEvents > 0 ? (totalSignupsCount / totalEvents).toFixed(1) : 0;

    // Calculate popular events
    const popularEvents = [...(ngo.events || [])]
      .sort((a, b) => (b.signups?.length || 0) - (a.signups?.length || 0))
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Link to="/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            Organization Reports
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
            <div className="text-blue-100 text-sm font-medium mb-1">Total Engagement</div>
            <div className="text-3xl font-bold">{totalSignupsCount}</div>
            <div className="text-blue-100 text-xs mt-2">Signups across all events</div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
            <div className="text-purple-100 text-sm font-medium mb-1">Avg. Attendance</div>
            <div className="text-3xl font-bold">{avgVolunteers}</div>
            <div className="text-purple-100 text-xs mt-2">Volunteers per event</div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none">
            <div className="text-emerald-100 text-sm font-medium mb-1">Active Volunteers</div>
            <div className="text-3xl font-bold">{uniqueVolunteers.length}</div>
            <div className="text-emerald-100 text-xs mt-2">Unique individuals</div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Top Performing Events
          </h2>
          <div className="space-y-4">
            {popularEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-xs text-gray-500">
                    {isValid(new Date(event.date)) ? format(new Date(event.date), 'MMM dd, yyyy') : 'Invalid Date'}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <div className="text-lg font-bold text-gray-900">{event.signups?.length || 0}</div>
                    <div className="text-xs text-gray-500">Signups</div>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${Math.min(100, ((event.signups?.length || 0) / (totalSignupsCount || 1)) * 100 * 2)}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
            {popularEvents.length === 0 && (
              <p className="text-center text-gray-500 py-4">No events to display</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN DASHBOARD ---
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            {uniqueVolunteers.length}
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
            <TrendingUp className="w-6 h-6 text-purple-600" />
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
              className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition duration-200 flex flex-col items-center justify-center"
            >
              <Plus className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Event</span>
            </Link>

            <Link
              to="/badges/create"
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition duration-200 flex flex-col items-center justify-center"
            >
              <Award className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Badge</span>
            </Link>

            <Link
              to="/dashboard?tab=volunteers"
              className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition duration-200 flex flex-col items-center justify-center"
            >
              <Users className="w-8 h-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Volunteers</span>
            </Link>

            <Link
              to="/dashboard?tab=reports"
              className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition duration-200 flex flex-col items-center justify-center"
            >
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event: Event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 pr-4">
                    <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {isValid(new Date(event.date)) ? format(new Date(event.date), 'MMM dd, yyyy') : 'Invalid Date'}
                    </p>
                  </div>
                  <Link 
                    to={`/events/${event.id}/manage`}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Manage
                  </Link>
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