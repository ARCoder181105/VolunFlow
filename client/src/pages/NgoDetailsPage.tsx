import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_NGO_BY_SLUG_QUERY } from '../graphql/queries/ngo.queries';
import { MY_PROFILE_QUERY } from '../graphql/queries/user.queries'; // Import this
import LoadingSpinner from '../components/common/LoadingSpinner';
import NgoProfile from '../components/ngo/NgoProfile';
import { Building } from 'lucide-react';
import type { NgoBySlugData } from '../types/ngo.types';
import type { MyProfileData } from '../types/user.types'; // Import this
import { useAuth } from '../hooks/useAuth';

const NgoDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  // 1. Fetch NGO Details
  const { data: ngoData, loading: ngoLoading, error: ngoError, refetch: refetchNgo } = useQuery<NgoBySlugData>(GET_NGO_BY_SLUG_QUERY, {
    variables: { slug: slug! },
    skip: !slug,
  });

  // 2. Fetch Current User's Profile (to get earned badges)
  // We use skip: !user so it doesn't run if not logged in
  const { data: profileData, loading: profileLoading } = useQuery<MyProfileData>(MY_PROFILE_QUERY, {
    skip: !user,
  });

  if (ngoLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading NGO details..." />
      </div>
    );
  }

  if (ngoError || !ngoData?.getNgoBySlug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            NGO Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn’t find the NGO you’re looking for. It may have been removed or doesn’t exist.
          </p>
          <button
            onClick={() => refetchNgo()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ngo = ngoData.getNgoBySlug;

  // 3. Extract the list of badge IDs the user has earned
  // We map the 'earnedBadges' array to just get the IDs of the badges
  const earnedBadgeIds = profileData?.myProfile?.earnedBadges?.map(
    (eb) => eb.badge.id
  ) || [];

  const isOwner = user?.role === 'NGO_ADMIN' && user?.adminOfNgoId === ngo.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <NgoProfile 
          ngo={ngo} 
          isAdmin={isOwner} 
          earnedBadgeIds={earnedBadgeIds} // <--- Pass the earned IDs here
        />
      </div>
    </div>
  );
};

export default NgoDetailsPage;