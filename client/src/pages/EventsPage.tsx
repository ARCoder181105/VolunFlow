import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { motion } from 'framer-motion';
import { Search, Calendar, Users, Sparkles, Filter, X } from 'lucide-react';
import { GET_ALL_EVENTS_QUERY } from '../graphql/queries/event.queries';
import { SIGNUP_FOR_EVENT_MUTATION, CANCEL_SIGNUP_MUTATION } from '../graphql/mutations/event.mutations';
import { MY_PROFILE_QUERY } from '../graphql/queries/user.queries';
import type { Event, AllEventsData } from '../types/event.types';
import type { MyProfileData } from '../types/user.types';
import EventList from '../components/events/EventList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: eventsData, loading: eventsLoading } = useQuery<AllEventsData>(GET_ALL_EVENTS_QUERY);
  const { data: profileData } = useQuery<MyProfileData>(MY_PROFILE_QUERY);
  
  const [signupForEvent] = useMutation(SIGNUP_FOR_EVENT_MUTATION, {
    refetchQueries: [GET_ALL_EVENTS_QUERY, MY_PROFILE_QUERY],
  });

  const [cancelSignup] = useMutation(CANCEL_SIGNUP_MUTATION, {
    refetchQueries: [GET_ALL_EVENTS_QUERY, MY_PROFILE_QUERY],
  });

  const userSignups = profileData?.myProfile.signups
    .filter((signup: { status: string }) => signup.status === 'CONFIRMED')
    .map((signup: { event: { id: string } }) => signup.event.id) || [];

  const handleSignUp = async (eventId: string) => {
    try {
      await signupForEvent({ variables: { eventId } });
    } catch (error) {
      console.error('Error signing up for event:', error);
      alert('Failed to sign up for event');
    }
  };

  const handleCancel = async (eventId: string) => {
    try {
      await cancelSignup({ variables: { eventId } });
    } catch (error) {
      console.error('Error canceling signup:', error);
      alert('Failed to cancel signup');
    }
  };

  const filteredEvents = eventsData?.getAllEvents.filter((event: Event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       event.tags.some((tag: string) => selectedTags.includes(tag));
    return matchesSearch && matchesTags;
  }) || [];

  const allTags = Array.from(new Set(eventsData?.getAllEvents.flatMap((event: Event) => event.tags) || [])) as string[];

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

  // const itemVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       duration: 0.5,
  //     },
  //   },
  // };

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with background */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative overflow-hidden rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2000&auto=format&fit=crop)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/90" />
          </div>

          <div className="relative z-10 px-6 py-10 sm:px-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4 border border-white/20"
            >
              <Sparkles className="w-4 h-4" />
              Discover Opportunities
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white mb-3">Volunteering Events</h1>
            <p className="text-white/90 text-lg max-w-3xl">
              Discover opportunities to make a difference in your community
            </p>

            {/* Quick Stats */}
            <div className="mt-6 flex flex-wrap gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20"
              >
                <Calendar className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">{eventsData?.getAllEvents.length || 0} Events</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20"
              >
                <Users className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">{userSignups.length} Registered</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Filter by category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag: string, index: number) => (
                  <motion.button
                    key={tag || index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter((t: string) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="w-3 h-3 ml-1 inline-block" />
                    )}
                  </motion.button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTags([])}
                  className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Results Summary */}
        {searchTerm || selectedTags.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{filteredEvents.length}</span> events
              {searchTerm && <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>}
              {selectedTags.length > 0 && (
                <span> with tags: {selectedTags.map((tag, i) => (
                  <span key={tag} className="font-semibold">
                    {tag}{i < selectedTags.length - 1 ? ', ' : ''}
                  </span>
                ))}</span>
              )}
            </p>
          </motion.div>
        ) : null}

        {/* Events List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <EventList
            events={filteredEvents}
            onSignUp={handleSignUp}
            onCancel={handleCancel}
            userSignups={userSignups}
          />
        </motion.div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Calendar className="w-10 h-10 text-purple-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedTags.length > 0
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back later for new volunteering opportunities.'
              }
            </p>
            {(searchTerm || selectedTags.length > 0) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTags([]);
                }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear filters
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;