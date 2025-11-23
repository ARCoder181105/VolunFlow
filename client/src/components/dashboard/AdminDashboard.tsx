import { useQuery } from '@apollo/client/react';
import { motion } from 'framer-motion';
import { Users, Calendar, Award, Plus, Building, ArrowLeft, TrendingUp, Mail, Settings, Sparkles, BarChart3, Target } from 'lucide-react';
import { MY_NGO_QUERY } from '../../graphql/queries/ngo.queries';
import type { MyNgoData } from '../../types/ngo.types';
import type { Event } from '../../types/event.types';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link, useSearchParams } from 'react-router-dom';
import { isValid, format } from 'date-fns';

const AdminDashboard = () => {
  const { data, loading, error } = useQuery<MyNgoData>(MY_NGO_QUERY);
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // const cardHoverVariants = {
  //   hover: {
  //     y: -8,
  //     transition: {
  //       duration: 0.3,
  //       ease: "easeOut",
  //     },
  //   },
  // };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    console.error("AdminDashboard Error:", error);
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card text-center bg-red-50 border-red-200"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-red-700">Error loading NGO data</h3>
        <p className="text-red-600 mt-2">{error.message}</p>
      </motion.div>
    );
  }

  const ngo = data?.myNgo;

  if (!ngo) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        >
          <Building className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome, Admin!
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Your NGO profile isn't set up yet. Create one to start managing events and volunteers.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/ngo"
            className="btn-primary inline-flex items-center shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your NGO Profile
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  const upcomingEvents = ngo.events?.filter((event: Event) => {
    const eventDate = new Date(event.date);
    return isValid(eventDate) && eventDate > new Date();
  }) || [];
  
  const allSignups = ngo.events?.flatMap((event: Event) => {
    return (event.signups || []).map(s => ({ ...s, eventTitle: event.title, eventDate: event.date }));
  }) || [];
  
  const volunteersMap = new Map();
  allSignups.forEach((s: any) => {
    if (s.user && !volunteersMap.has(s.user.id)) {
      volunteersMap.set(s.user.id, {
        ...s.user,
        joinedAt: s.createdAt,
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
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <Users className="w-8 h-8 text-blue-600" />
            Manage Volunteers
          </h1>
          <motion.div 
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold"
            whileHover={{ scale: 1.05 }}
          >
            Total: {uniqueVolunteers.length}
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Volunteer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Events Attended</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uniqueVolunteers.map((volunteer: any, index) => (
                  <motion.tr 
                    key={volunteer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <motion.div 
                          className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md"
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {volunteer.avatarUrl ? (
                            <img src={volunteer.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            volunteer.name.charAt(0).toUpperCase()
                          )}
                        </motion.div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{volunteer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {volunteer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span 
                        className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm"
                        whileHover={{ scale: 1.1 }}
                      >
                        {volunteer.totalEvents} Events
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <motion.button 
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert('Email feature coming soon!')}
                      >
                        Email
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
                {uniqueVolunteers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No volunteers have signed up for your events yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // --- RENDER: REPORTS TAB ---
  if (currentTab === 'reports') {
    const totalEvents = ngo.events?.length || 0;
    const totalSignupsCount = allSignups.length;
    const avgVolunteers = totalEvents > 0 ? (totalSignupsCount / totalEvents).toFixed(1) : 0;

    const popularEvents = [...(ngo.events || [])]
      .sort((a, b) => (b.signups?.length || 0) - (a.signups?.length || 0))
      .slice(0, 5);

    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <BarChart3 className="w-8 h-8 text-purple-600" />
            Organization Reports
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Engagement', value: totalSignupsCount, desc: 'Signups across all events', gradient: 'from-blue-500 to-blue-600', icon: Users },
            { label: 'Avg. Attendance', value: avgVolunteers, desc: 'Volunteers per event', gradient: 'from-purple-500 to-purple-600', icon: Target },
            { label: 'Active Volunteers', value: uniqueVolunteers.length, desc: 'Unique individuals', gradient: 'from-emerald-500 to-emerald-600', icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className="card p-6 bg-gradient-to-br text-white border-none shadow-xl overflow-hidden relative"
              style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
            >
              <div className={`bg-gradient-to-br ${stat.gradient} absolute inset-0`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full bg-white/20 absolute -right-4 -top-4"
                  />
                </div>
                <div className="text-sm font-medium opacity-90 mb-1">{stat.label}</div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-xs opacity-75">{stat.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Top Performing Events
          </h2>
          <div className="space-y-4">
            {popularEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    #{index + 1}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-xs text-gray-500">
                      {isValid(new Date(event.date)) ? format(new Date(event.date), 'MMM dd, yyyy') : 'Invalid Date'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{event.signups?.length || 0}</div>
                    <div className="text-xs text-gray-500">Signups</div>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((event.signups?.length || 0) / (totalSignupsCount || 1)) * 100 * 2)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            {popularEvents.length === 0 && (
              <p className="text-center text-gray-500 py-8">No events to display</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // --- RENDER: MAIN DASHBOARD ---
  const stats = [
    { label: 'Total Events', value: ngo.events?.length || 0, icon: Calendar, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Unique Volunteers', value: uniqueVolunteers.length, icon: Users, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Badge Templates', value: ngo.badges?.length || 0, icon: Award, gradient: 'from-yellow-500 to-orange-500' },
    { label: 'Upcoming Events', value: upcomingEvents.length, icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover="hover"
            className="card text-center relative overflow-hidden group cursor-pointer"
          >
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
            />
            <motion.div 
              className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <stat.icon className="w-7 h-7 text-white" />
            </motion.div>
            <motion.h3 
              className="text-3xl font-bold text-gray-900 mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
            >
              {stat.value}
            </motion.h3>
            <p className="text-gray-600 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { to: '/events/create', icon: Plus, label: 'Create Event', gradient: 'from-blue-500 to-cyan-500' },
              { to: '/badges/create', icon: Award, label: 'Create Badge', gradient: 'from-yellow-500 to-orange-500' },
              { to: '/dashboard?tab=volunteers', icon: Users, label: 'Manage Volunteers', gradient: 'from-green-500 to-emerald-500' },
              { to: '/dashboard?tab=reports', icon: BarChart3, label: 'View Reports', gradient: 'from-purple-500 to-pink-500' },
            ].map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={action.to}
                  className="group relative h-full p-6 rounded-2xl bg-gradient-to-br text-white flex flex-col items-center justify-center text-center overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient}`} />
                  <action.icon className="w-8 h-8 relative z-10 mb-3" />
                  <span className="text-sm font-semibold relative z-10">{action.label}</span>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ scale: 0, borderRadius: "100%" }}
                    whileHover={{ scale: 2, borderRadius: "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={itemVariants} className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Upcoming Events
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event: Event, index) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="min-w-0 pr-4">
                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {isValid(new Date(event.date)) ? format(new Date(event.date), 'MMM dd, yyyy') : 'Invalid Date'}
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link 
                      to={`/events/${event.id}/manage`}
                      className="shrink-0 px-4 py-2 text-xs font-semibold bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Settings className="w-3 h-3" />
                      Manage
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No upcoming events</p>
          )}
        </motion.div>
      </div>

      {/* NGO Info */}
      <motion.div variants={itemVariants} className="card bg-gradient-to-br from-gray-50 to-white">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building className="w-6 h-6 text-indigo-500" />
          NGO Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Basic Info</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Name</dt>
                  <dd className="text-gray-900 font-medium">{ngo.name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Contact Email</dt>
                  <dd className="text-gray-900 font-medium">{ngo.contactEmail}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Website</dt>
                  <dd className="text-gray-900 font-medium">{ngo.website || 'Not provided'}</dd>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed">{ngo.description}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;