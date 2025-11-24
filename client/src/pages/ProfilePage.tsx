import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, Edit3, MapPin, Clock, CheckCircle } from 'lucide-react';
import { MY_PROFILE_QUERY } from '../graphql/queries/user.queries';
import { UPDATE_USER_MUTATION } from '../graphql/mutations/user.mutations';
import type { MyProfileData } from '../types/user.types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EditProfileForm from '../components/auth/EditProfileForm';
import { format, isValid } from 'date-fns';

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
  };
  awardedAt: string;
};

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data, loading, error, refetch } = useQuery<MyProfileData>(MY_PROFILE_QUERY);

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      refetch();
      setIsEditing(false);
    },
  });

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
  if (error) return <div>Error loading profile</div>;

  const profile = data?.myProfile;

  const upcomingEvents = profile?.signups?.filter((signup: SignupItem) => {
    const eventDate = new Date(signup.event.date);
    return isValid(eventDate) && eventDate > new Date() && signup.status === 'CONFIRMED';
  }) || [];

  const pastEvents = profile?.signups?.filter((signup: SignupItem) => {
    const eventDate = new Date(signup.event.date);
    return isValid(eventDate) && eventDate <= new Date();
  }) || [];

  const handleUpdateProfile = async (data: { name: string; avatarUrl?: string }) => {
    try {
      await updateUser({
        variables: {
          input: {
            name: data.name,
            ...(data.avatarUrl && { avatarUrl: data.avatarUrl })
          }
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h1>
                <p className="text-gray-600">Update your personal information</p>
              </div>

              <EditProfileForm
                user={profile}
                onSubmit={handleUpdateProfile}
                onCancel={() => setIsEditing(false)}
                loading={updateLoading}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative overflow-hidden rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000&auto=format&fit=crop)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90" />
          </div>

          <div className="relative z-10 px-6 py-10 sm:px-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="relative"
              >
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                )}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white"
                >
                  <Edit3 className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                  <h1 className="text-3xl font-bold text-white">{profile?.name}</h1>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start text-white/90">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profile?.email}</span>
                  </div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/20">
                    {profile?.role?.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { label: 'Total Events', value: profile?.signups?.length || 0, icon: Calendar, color: 'bg-blue-500' },
            { label: 'Upcoming', value: upcomingEvents.length, icon: Clock, color: 'bg-emerald-500' },
            { label: 'Badges Earned', value: profile?.earnedBadges?.length || 0, icon: Award, color: 'bg-amber-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="card text-center"
            >
              <motion.div
                className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon className="w-7 h-7 text-white" />
              </motion.div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                Upcoming Events
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {upcomingEvents.length}
              </span>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((signup: SignupItem, index) => {
                  const eventDate = new Date(signup.event.date);
                  const isDateValid = isValid(eventDate);
                  return (
                    <motion.div
                      key={signup.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-100"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{signup.event.title}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {isDateValid ? format(eventDate, 'MMM dd, yyyy • hh:mm a') : "Invalid Date"}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          {signup.event.location}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600">No upcoming events</p>
              </div>
            )}
          </motion.div>

          {/* Badges */}
          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                Badges Earned
              </h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                {profile?.earnedBadges?.length || 0}
              </span>
            </div>
            {profile?.earnedBadges && profile.earnedBadges.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {profile.earnedBadges.map((earnedBadge: EarnedBadgeItem, index) => {
                  const awardedDate = new Date(earnedBadge.awardedAt);
                  const isDateValid = isValid(awardedDate);
                  return (
                    <motion.div
                      key={earnedBadge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100"
                    >
                      <motion.img
                        src={earnedBadge.badge.imageUrl}
                        alt={earnedBadge.badge.name}
                        className="w-16 h-16 mx-auto mb-3 rounded-xl object-cover shadow-md"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      />
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {earnedBadge.badge.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {isDateValid ? format(awardedDate, 'MMM yyyy') : '...'}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-gray-600">No badges earned yet</p>
              </div>
            )}
          </motion.div>

          {/* Past Events */}
          <motion.div variants={itemVariants} className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                Past Events
              </h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                {pastEvents.length}
              </span>
            </div>
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.map((signup: SignupItem, index) => {
                  const eventDate = new Date(signup.event.date);
                  const isDateValid = isValid(eventDate);
                  return (
                    <motion.div
                      key={signup.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1">{signup.event.title}</h3>
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {isDateValid ? format(eventDate, 'MMM dd, yyyy') : 'Invalid Date'} • {signup.event.location}
                      </p>
                      <span className="inline-block px-2 py-1 bg-emerald-200 text-emerald-800 text-xs font-semibold rounded-full">
                        Completed
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-gray-600">No past events</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;