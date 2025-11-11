import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Search, Filter, Plus, Building, Users } from 'lucide-react';
import { MY_NGO_QUERY, GET_ALL_NGOS_QUERY } from '../graphql/queries/ngo.queries';
import { CREATE_NGO_MUTATION } from '../graphql/mutations/ngo.mutations';
import type { NGO } from '../types/ngo.types';
import { useAuth } from '../hooks/useAuth';
import NgoCard from '../components/ngo/NgoCard';
import NgoForm from '../components/ngo/NgoForm';
import NgoProfile from '../components/ngo/NgoProfile';
import LoadingSpinner from '../components/common/LoadingSpinner';

const NGOPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'browse' | 'my-ngo' | 'create'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch the user's NGO (if admin)
  const {
    data: myNgoData,
    loading: myNgoLoading,
    error: myNgoError,
    refetch: refetchMyNgo
  } = useQuery(MY_NGO_QUERY, {
    skip: !user || user.role !== 'NGO_ADMIN',
  });

  // Fetch all NGOs (for Browse view)
  const {
    data: allNgosData,
    loading: allNgosLoading,
    error: allNgosError,
    refetch: refetchAllNgos
  } = useQuery(GET_ALL_NGOS_QUERY, {
    skip: activeView !== 'browse', // only fetch when browsing
  });

  const [createNgo, { loading: createLoading, error: createError }] = useMutation(CREATE_NGO_MUTATION, {
    onCompleted: () => {
      refetchMyNgo();
      setActiveView('my-ngo');
    },
    onError: (error) => {
      console.error('Error creating NGO:', error);
    }
  });

  const isNgoAdmin = user?.role === 'NGO_ADMIN';
  const userNgo = myNgoData?.myNgo;
  const ngos =
    activeView === 'browse'
      ? allNgosData?.getAllNgos || []
      : userNgo
      ? [userNgo]
      : [];

  // Filter NGOs based on search and category
  const filteredNgos = ngos.filter((ngo: NGO) => {
    const matchesSearch =
      ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ngo.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      ngo.badges?.some(badge =>
        badge.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from badges for filtering
  const categories = Array.from(
    new Set(
      ngos.flatMap((ngo: NGO) =>
        ngo.badges?.map(badge => badge.name) || []
      )
    )
  );

  const handleCreateNgo = async (input: any) => {
    try {
      await createNgo({ variables: { input } });
    } catch (error) {
      console.error('Error creating NGO:', error);
    }
  };

  const handleEditNgo = () => {
    console.log('Edit NGO clicked');
  };

  // Loading states
  if (myNgoLoading || (allNgosLoading && activeView === 'browse')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Loading NGOs..." />
        </div>
      </div>
    );
  }

  // Error handling
  if (myNgoError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Your NGO</h2>
              <p className="text-red-700 mb-4">
                There was a problem connecting to the server. Please check your connection and try again.
              </p>
              <button onClick={() => refetchMyNgo()} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (allNgosError && activeView === 'browse') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load NGOs</h2>
              <p className="text-red-700 mb-4">
                There was a problem connecting to the server. Please check your connection and try again.
              </p>
              <button onClick={() => refetchAllNgos()} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Non-Profit Organizations</h1>
              <p className="text-gray-600">
                {isNgoAdmin && userNgo
                  ? 'Manage your NGO and engage with volunteers'
                  : 'Discover and connect with NGOs making a difference in your community'}
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveView('browse')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  activeView === 'browse'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building className="w-4 h-4 mr-2" />
                Browse NGOs
              </button>

              {isNgoAdmin && userNgo && (
                <button
                  onClick={() => setActiveView('my-ngo')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                    activeView === 'my-ngo'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  My NGO
                </button>
              )}

              {!userNgo && (
                <button
                  onClick={() => setActiveView('create')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                    activeView === 'create'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create NGO
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{ngos.length}</div>
                <div className="text-gray-600">NGOs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {ngos.reduce((acc: number, ngo: NGO) => acc + (ngo.events?.length || 0), 0)}
                </div>
                <div className="text-gray-600">Total Events</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert for Create NGO */}
        {createError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to create NGO</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{createError.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active View */}
        {activeView === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search NGOs by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {categories.length > 0 && (
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {filteredNgos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNgos.map((ngo: NGO) => (
                  <NgoCard key={ngo.id} ngo={ngo} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No NGOs Found</h3>
                <p className="text-gray-600 mb-4">
                  There are no NGOs to display at the moment.
                </p>
                {!userNgo && (
                  <button
                    onClick={() => setActiveView('create')}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create an NGO
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === 'my-ngo' && userNgo && (
          <NgoProfile ngo={userNgo} isAdmin={true} onEdit={handleEditNgo} />
        )}

        {activeView === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your NGO</h2>
                <p className="text-gray-600">
                  Register your non-profit organization to start creating events and engaging with volunteers.
                </p>
              </div>

              <NgoForm onSubmit={handleCreateNgo} loading={createLoading} mode="create" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOPage;
