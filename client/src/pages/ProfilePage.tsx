import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { User, Mail, Calendar, Award, Edit3 } from 'lucide-react';
import { MY_PROFILE_QUERY } from '../graphql/queries/user.queries';
import { UPDATE_USER_MUTATION } from '../graphql/mutations/user.mutations';
import type { MyProfileData } from '../types/user.types'; // Import from types
import LoadingSpinner from '../components/common/LoadingSpinner';
import EditProfileForm from '../components/auth/EditProfileForm';
import { format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data, loading, error, refetch } = useQuery<MyProfileData>(MY_PROFILE_QUERY);
  
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      refetch();
      setIsEditing(false);
    },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading profile</div>;

  const profile = data?.myProfile;
  const upcomingEvents = profile?.signups?.filter(signup => 
    new Date(signup.event.date) > new Date() && signup.status === 'CONFIRMED'
  ) || [];

  const pastEvents = profile?.signups?.filter(signup => 
    new Date(signup.event.date) <= new Date()
  ) || [];

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
          <div className="max-w-2xl mx-auto">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="card mb-8">
            <div className="flex items-center space-x-6">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              )}
              <div className="flex-grow">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profile?.email}</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {profile?.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of the profile page remains the same */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Events ({upcomingEvents.length})
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((signup) => (
                    <div key={signup.id} className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">{signup.event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(signup.event.date), 'MMM dd, yyyy • hh:mm a')}
                      </p>
                      <p className="text-sm text-gray-600">{signup.event.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No upcoming events</p>
              )}
            </div>

            {/* Badges */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Badges Earned ({profile?.earnedBadges?.length || 0})
              </h2>
              {profile?.earnedBadges && profile.earnedBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {profile.earnedBadges.map((earnedBadge) => (
                    <div key={earnedBadge.id} className="text-center">
                      <img
                        src={earnedBadge.badge.imageUrl}
                        alt={earnedBadge.badge.name}
                        className="w-16 h-16 mx-auto mb-2 rounded-lg object-cover"
                      />
                      <h3 className="text-sm font-medium text-gray-900">
                        {earnedBadge.badge.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {format(new Date(earnedBadge.awardedAt), 'MMM yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No badges earned yet</p>
              )}
            </div>

            {/* Past Events */}
            <div className="card lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Past Events ({pastEvents.length})
              </h2>
              {pastEvents.length > 0 ? (
                <div className="space-y-3">
                  {pastEvents.map((signup) => (
                    <div key={signup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{signup.event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {format(new Date(signup.event.date), 'MMM dd, yyyy')} • {signup.event.location}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Completed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No past events</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;