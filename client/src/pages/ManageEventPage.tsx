import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  ArrowLeft, Calendar, MapPin, CheckCircle2, XCircle, Award, Search 
} from 'lucide-react';
import { format } from 'date-fns';

import { GET_EVENT_DETAILS_QUERY } from '../graphql/queries/event.queries';
import { MY_NGO_QUERY } from '../graphql/queries/ngo.queries';
import { MARK_ATTENDANCE_MUTATION } from '../graphql/mutations/event.mutations';
import { AWARD_BADGE_MUTATION } from '../graphql/mutations/badge.mutations';

// Import the types for the query results
import type { EventDetailsData } from '../types/event.types';
import type { MyNgoData } from '../types/ngo.types';

import LoadingSpinner from '../components/common/LoadingSpinner';

// Simple Modal for awarding badges
const AwardBadgeModal = ({ isOpen, onClose, onAward, badges, volunteerName }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Award Badge to {volunteerName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {badges.length === 0 ? (
            <p className="text-gray-500 text-center">No badges available to award. Create some first!</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge: any) => (
                <button
                  key={badge.id}
                  onClick={() => onAward(badge.id)}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-center group"
                >
                  <img src={badge.imageUrl} alt={badge.name} className="w-16 h-16 rounded-full mb-2 object-cover group-hover:scale-105 transition-transform" />
                  <span className="font-medium text-sm text-gray-900">{badge.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<{id: string, name: string} | null>(null);

  // 1. Fetch Event Details (includes signups)
  // FIX: Added <EventDetailsData> generic
  const { 
    data: eventData, 
    loading: eventLoading, 
    refetch: refetchEvent 
  } = useQuery<EventDetailsData>(GET_EVENT_DETAILS_QUERY, {
    variables: { eventId },
    skip: !eventId
  });

  // 2. Fetch NGO Badges (to award)
  // FIX: Added <MyNgoData> generic
  const { data: ngoData } = useQuery<MyNgoData>(MY_NGO_QUERY);

  // 3. Mutation: Mark Attendance
  const [markAttendance] = useMutation(MARK_ATTENDANCE_MUTATION, {
    onCompleted: () => refetchEvent(),
    onError: (err) => alert(err.message)
  });

  // 4. Mutation: Award Badge
  const [awardBadge] = useMutation(AWARD_BADGE_MUTATION, {
    onCompleted: () => {
      alert(`Badge awarded successfully!`);
      setSelectedVolunteer(null);
    },
    onError: (err) => alert(err.message)
  });

  if (eventLoading) return <div className="min-h-screen bg-gray-50 p-8"><LoadingSpinner /></div>;

  const event = eventData?.getEventDetails;
  const badges = ngoData?.myNgo?.badges || [];

  if (!event) return <div>Event not found</div>;

  // Filter signups
  const filteredSignups = event.signups?.filter((signup: any) => 
    signup.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signup.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAttendanceToggle = async (signupId: string, currentStatus: string) => {
    const isAttended = currentStatus === 'ATTENDED';
    await markAttendance({
      variables: {
        signupId,
        attended: !isAttended
      }
    });
  };

  const handleAwardBadge = async (badgeId: string) => {
    if (!selectedVolunteer) return;
    await awardBadge({
      variables: {
        userId: selectedVolunteer.id,
        badgeId
      }
    });
  };

  const stats = {
    total: event.signups ? event.signups.length : 0,
    attended: event.signups ? event.signups.filter((s: any) => s.status === 'ATTENDED').length : 0,
    confirmed: event.signups ? event.signups.filter((s: any) => s.status === 'CONFIRMED').length : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard?tab=volunteers" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
              <div className="flex items-center text-sm text-gray-500 gap-3">
                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {format(new Date(event.date), 'MMM dd, yyyy')}</span>
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {event.location}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 text-sm font-medium">
             <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">Total: {stats.total}</div>
             <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full">Attended: {stats.attended}</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Toolbar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
           <div className="relative max-w-sm w-full">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search volunteer..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volunteer</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSignups.map((signup: any) => (
                <tr key={signup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                        {signup.user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{signup.user.name}</div>
                        <div className="text-sm text-gray-500">{signup.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                     <button
                       onClick={() => handleAttendanceToggle(signup.id, signup.status)}
                       className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                         signup.status === 'ATTENDED' 
                           ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                       }`}
                     >
                       {signup.status === 'ATTENDED' ? <CheckCircle2 className="w-3 h-3 mr-1"/> : <XCircle className="w-3 h-3 mr-1"/>}
                       {signup.status === 'ATTENDED' ? 'Present' : 'Absent'}
                     </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => setSelectedVolunteer({ id: signup.user.id, name: signup.user.name })}
                      className="text-yellow-600 hover:text-yellow-700 font-medium text-sm flex items-center justify-end w-full gap-1"
                    >
                      <Award className="w-4 h-4" /> Award Badge
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSignups.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No volunteers found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badge Modal */}
      <AwardBadgeModal 
        isOpen={!!selectedVolunteer} 
        volunteerName={selectedVolunteer?.name}
        badges={badges}
        onClose={() => setSelectedVolunteer(null)}
        onAward={handleAwardBadge}
      />
    </div>
  );
};

export default ManageEventPage;