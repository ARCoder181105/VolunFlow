import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Building, Users, Sparkles } from 'lucide-react';
import { MY_NGO_QUERY, GET_ALL_NGOS_QUERY } from '../graphql/queries/ngo.queries';
import { CREATE_NGO_MUTATION } from '../graphql/mutations/ngo.mutations';
import type { NGO, MyNgoData, AllNgosData, CreateNgoInput } from '../types/ngo.types';
import { useAuth } from '../hooks/useAuth';
import NgoCard from '../components/ngo/NgoCard';
import NgoForm from '../components/ngo/NgoForm';
import NgoProfile from '../components/ngo/NgoProfile';
import LoadingSpinner from '../components/common/LoadingSpinner';

const NGOPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'browse' | 'my-ngo' | 'create'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    data: myNgoData,
    loading: myNgoLoading,
    error: myNgoError,
    refetch: refetchMyNgo
  } = useQuery<MyNgoData>(MY_NGO_QUERY, {
    skip: !user || user.role !== 'NGO_ADMIN',
  });

  const {
    data: allNgosData,
    loading: allNgosLoading,
    error: allNgosError,
    refetch: refetchAllNgos
  } = useQuery<AllNgosData>(GET_ALL_NGOS_QUERY, {
    skip: activeView !== 'browse',
  });

  const [createNgo, { loading: createLoading, error: createError }] = useMutation(CREATE_NGO_MUTATION, {
    onCompleted: () => {
      refetchMyNgo();
      setActiveView('my-ngo');
    },
    onError: (error: any) => {
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

  const categories = Array.from(
    new Set(
      ngos.flatMap((ngo: NGO) =>
        ngo.badges?.map(badge => badge.name) || []
      )
    )
  ) as string[];

  const handleCreateNgo = async (input: CreateNgoInput) => {
    try {
      await createNgo({ variables: { input } });
    } catch (error) {
      console.error('Error creating NGO:', error);
    }
  };

  const handleEditNgo = () => {
    console.log('Edit NGO clicked');
  };

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

  if (myNgoLoading || (allNgosLoading && activeView === 'browse')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Loading NGOs..." />
        </div>
      </div>
    );
  }

  if (myNgoError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Your NGO</h2>
              <p className="text-red-700 mb-4">
                There was a problem connecting to the server. Please check your connection and try again.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refetchMyNgo()}
                className="btn-primary"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (allNgosError && activeView === 'browse') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load NGOs</h2>
              <p className="text-red-700 mb-4">
                There was a problem connecting to the server. Please check your connection and try again.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refetchAllNgos()}
                className="btn-primary"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with background image */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative overflow-hidden rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/90" />
          </div>

          <div className="relative z-10 px-6 py-10 sm:px-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4 border border-white/20"
            >
              <Sparkles className="w-4 h-4" />
              Discover Organizations
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-3">Non-Profit Organizations</h1>
            <p className="text-white/90 text-lg max-w-3xl">
              {isNgoAdmin && userNgo
                ? 'Manage your NGO and engage with volunteers'
                : 'Discover and connect with NGOs making a difference in your community'}
            </p>
          </div>
        </motion.div>

        {/* View Toggle & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('browse')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeView === 'browse'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Building className="w-5 h-5" />
                Browse NGOs
              </motion.button>

              {isNgoAdmin && userNgo && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveView('my-ngo')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeView === 'my-ngo'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Users className="w-5 h-5" />
                  My NGO
                </motion.button>
              )}

              {!userNgo && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveView('create')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeView === 'create'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Plus className="w-5 h-5" />
                  Create NGO
                </motion.button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{ngos.length}</div>
                <div className="text-sm text-gray-600">NGOs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {ngos.reduce((acc: number, ngo: NGO) => acc + (ngo.events?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {createError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to create NGO</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{createError.message}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active View Content */}
        {activeView === 'browse' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search NGOs by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {categories.length > 0 && (
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
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
            </motion.div>

            {/* NGO Grid */}
            {filteredNgos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNgos.map((ngo: NGO, index) => (
                  <motion.div
                    key={ngo.id}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <NgoCard ngo={ngo} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Building className="w-10 h-10 text-blue-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No NGOs Found</h3>
                <p className="text-gray-600 mb-6">
                  There are no NGOs to display at the moment.
                </p>
                {!userNgo && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('create')}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create an NGO
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {activeView === 'my-ngo' && userNgo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NgoProfile ngo={userNgo} isAdmin={true} onEdit={handleEditNgo} />
          </motion.div>
        )}

        {activeView === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Your NGO</h2>
                    <p className="text-gray-600">
                      Register your organization to start creating events and engaging volunteers.
                    </p>
                  </div>
                </div>
              </div>

              <NgoForm onSubmit={handleCreateNgo} loading={createLoading} mode="create" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NGOPage;