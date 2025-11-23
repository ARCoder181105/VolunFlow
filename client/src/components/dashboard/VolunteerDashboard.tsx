import { useQuery } from '@apollo/client/react';
import { motion } from 'framer-motion';
import { Calendar, Award, TrendingUp, Sparkles, Target, Heart, MapPin, Clock } from 'lucide-react';
import { MY_PROFILE_QUERY } from '../../graphql/queries/user.queries';
import type { MyProfileData } from '../../types/user.types';
import LoadingSpinner from '../common/LoadingSpinner';
import { isValid, format } from 'date-fns';

type SignupItem = {
  id: string;
  event: {
    title: string;
    date: string;
    location: string;
  };
  status: string;
};

type EarnedBadgeItem = {
  id: string;
  badge: {
    imageUrl: string;
    name: string;
    description: string;
  };
  awardedAt: string;
};

const VolunteerDashboard = () => {
  const { data, loading, error } = useQuery<MyProfileData>(MY_PROFILE_QUERY);

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

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading dashboard</div>;

  const profile = data?.myProfile;

  const upcomingEvents = profile?.signups?.filter((signup: SignupItem) => {
    const eventDate = new Date(signup.event.date);
    return isValid(eventDate) && eventDate > new Date() && signup.status === 'CONFIRMED';
  }) || [];

  const earnedBadges = profile?.earnedBadges || [];

  const stats = [
    {
      label: 'Total Events',
      value: profile?.signups?.length || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      description: 'Events attended'
    },
    {
      label: 'Upcoming Events',
      value: upcomingEvents.length,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      description: 'Ready to volunteer'
    },
    {
      label: 'Badges Earned',
      value: earnedBadges.length,
      icon: Award,
      color: 'bg-amber-500',
      description: 'Achievements unlocked'
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2000&auto=format&fit=crop)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/90" />
        </div>

        {/* Subtle animated accent */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* <div className="relative z-10 p-8 text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/20"
          >
            <Sparkles className="w-4 h-4" />
            Welcome back!
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Your Impact Dashboard</h1>
          <p className="text-white/90 text-lg">Track your volunteering journey and celebrate your achievements</p>
        </div> */}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="card text-center relative overflow-hidden group bg-white"
          >
            <motion.div
              className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <stat.icon className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h3
              className="text-4xl font-bold text-gray-900 mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
            >
              {stat.value}
            </motion.h3>
            <p className="text-gray-900 font-semibold mb-1">{stat.label}</p>
            <p className="text-gray-500 text-sm">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Upcoming Events
            </h2>
            <motion.span
              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              {upcomingEvents.length}
            </motion.span>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map((signup: SignupItem, index) => {
                const eventDate = new Date(signup.event.date);
                const isDateValid = isValid(eventDate);
                return (
                  <motion.div
                    key={signup.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-100 transition-all"
                  >
                    <motion.div
                      className="shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Calendar className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="grow min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{signup.event.title}</h4>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {isDateValid ? format(eventDate, 'MMM dd, yyyy • hh:mm a') : 'Invalid Date'}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {signup.event.location}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Calendar className="w-10 h-10 text-blue-600" />
              </motion.div>
              <p className="text-gray-600 mb-4">No upcoming events</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow-md hover:bg-blue-600 transition-colors"
              >
                Browse Events
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Recent Badges */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Recent Badges
            </h2>
            <motion.span
              className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-semibold shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              {earnedBadges.length}
            </motion.span>
          </div>
          {earnedBadges.length > 0 ? (
            <div className="space-y-4">
              {earnedBadges.slice(0, 3).map((earnedBadge: EarnedBadgeItem, index) => {
                const awardedDate = new Date(earnedBadge.awardedAt);
                const isDateValid = isValid(awardedDate);
                return (
                  <motion.div
                    key={earnedBadge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-gray-100 transition-all"
                  >
                    <motion.img
                      src={earnedBadge.badge.imageUrl}
                      alt={earnedBadge.badge.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-lg"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="grow">
                      <h4 className="font-semibold text-gray-900">{earnedBadge.badge.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Earned on {isDateValid ? format(awardedDate, 'MMM dd, yyyy') : '...'}
                      </p>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      className="shrink-0"
                    >
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Award className="w-10 h-10 text-yellow-600" />
              </motion.div>
              <p className="text-gray-600 mb-4">No badges earned yet</p>
              <p className="text-sm text-gray-500">Start volunteering to earn badges!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Impact Section */}
      <motion.div
        variants={itemVariants}
        className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Heart className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900">Your Impact</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Lives Touched', value: (profile?.signups?.length || 0) * 10, icon: Heart },
            { label: 'Hours Contributed', value: (profile?.signups?.length || 0) * 4, icon: Clock },
            { label: 'Communities Helped', value: Math.ceil((profile?.signups?.length || 0) / 2), icon: Target },
          ].map((impact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 bg-white rounded-xl shadow-sm"
            >
              <impact.icon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{impact.value}</div>
              <div className="text-sm text-gray-600">{impact.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-700 mt-6 font-medium"
        >
          🎉 You're making a real difference in your community!
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default VolunteerDashboard;