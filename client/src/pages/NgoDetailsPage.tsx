import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_NGO_BY_SLUG_QUERY } from '../graphql/queries/ngo.queries';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NgoProfile from '../components/ngo/NgoProfile';
import { Building } from 'lucide-react';
import type { NgoBySlugData } from '../types/ngo.types';
import { useAuth } from '../hooks/useAuth'; // 1. Import useAuth

const NgoDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth(); // 2. Get current user

  const { data, loading, error, refetch } = useQuery<NgoBySlugData>(GET_NGO_BY_SLUG_QUERY, {
    variables: { slug: slug! },
    skip: !slug,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading NGO details..." />
      </div>
    );
  }

  if (error || !data?.getNgoBySlug) {
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
            onClick={() => refetch()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ngo = data.getNgoBySlug;

  // 3. Check if the current user is the admin of THIS specific NGO
  const isOwner = 
    user?.role === 'NGO_ADMIN' && 
    user?.adminOfNgoId === ngo.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        {/* 4. Pass the calculated permission to the profile component */}
        <NgoProfile 
          ngo={ngo} 
          isAdmin={isOwner} 
          onEdit={() => console.log("Edit clicked")} // You can wire up edit functionality here later
        />
      </div>
    </div>
  );
};

export default NgoDetailsPage;