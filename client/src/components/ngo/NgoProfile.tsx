import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { 
  Building, 
  MapPin, 
  Mail, 
  Globe, 
  Calendar, 
  Award, 
  Edit3, 
  Plus, 
  Trash2 
} from 'lucide-react';
import type { NGO } from '../../types/ngo.types';
import type { Event } from '../../types/event.types';
import EventCard from '../events/EventCard';
import BadgeCard from '../badges/BadgeCard';
import AddBranchModal, { type BranchFormData } from './AddBranchModal';
import AddEventModal from '../events/AddEventModal';
import AddBadgeModal from '../badges/AddBadgeModal';
import EditNgoModal, { type EditNgoFormData } from './EditNgoModal'; // <--- Import Edit Modal
import { isValid } from 'date-fns';
import { ADD_BRANCH_MUTATION, DELETE_BRANCH_MUTATION } from '../../graphql/mutations/branch.mutations';
import { CREATE_EVENT_MUTATION } from '../../graphql/mutations/event.mutations';
import { CREATE_BADGE_TEMPLATE_MUTATION } from '../../graphql/mutations/badge.mutations';
import { UPDATE_NGO_MUTATION } from '../../graphql/mutations/ngo.mutations'; // <--- Import Update Mutation
import { MY_NGO_QUERY } from '../../graphql/queries/ngo.queries';

interface NgoProfileProps {
  ngo: NGO;
  isAdmin?: boolean;
  onEdit?: () => void; // This is now optional/unused since we handle it internally
  userSignups?: string[];
  onEventSignUp?: (eventId: string) => void;
  onEventCancel?: (eventId: string) => void;
}

const NgoProfile: React.FC<NgoProfileProps> = ({
  ngo,
  isAdmin = false,
  userSignups = [],
  onEventSignUp,
  onEventCancel
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'badges' | 'branches'>('events');
  
  // --- Modal States ---
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddBadgeModalOpen, setIsAddBadgeModalOpen] = useState(false);
  const [isEditNgoModalOpen, setIsEditNgoModalOpen] = useState(false); // <--- New State

  // --- Mutations ---
  const [addBranch, { loading: isAddingBranch }] = useMutation(ADD_BRANCH_MUTATION, {
    refetchQueries: [MY_NGO_QUERY],
    onCompleted: () => setIsAddBranchModalOpen(false),
    onError: (err) => alert(err.message),
  });

  const [deleteBranch] = useMutation(DELETE_BRANCH_MUTATION, {
    refetchQueries: [MY_NGO_QUERY],
    onError: (err) => alert(err.message),
  });

  const [createEvent, { loading: isCreatingEvent }] = useMutation(CREATE_EVENT_MUTATION, {
    refetchQueries: [MY_NGO_QUERY],
    onCompleted: () => setIsAddEventModalOpen(false),
    onError: (err) => alert(err.message),
  });

  const [createBadge, { loading: isCreatingBadge }] = useMutation(CREATE_BADGE_TEMPLATE_MUTATION, {
    refetchQueries: [MY_NGO_QUERY],
    onCompleted: () => setIsAddBadgeModalOpen(false),
    onError: (err) => alert(err.message),
  });

  // New Mutation for updating NGO Profile
  const [updateNgo, { loading: isUpdatingNgo }] = useMutation(UPDATE_NGO_MUTATION, {
    refetchQueries: [MY_NGO_QUERY],
    onCompleted: () => setIsEditNgoModalOpen(false),
    onError: (err) => alert(err.message),
  });

  // --- Handlers ---
  const handleAddBranchSubmit = async (data: BranchFormData) => {
    await addBranch({ variables: { input: data } });
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      await deleteBranch({ variables: { branchId } });
    }
  };

  const handleAddEventSubmit = async (data: any) => {
    await createEvent({ variables: { input: data } });
  };

  const handleAddBadgeSubmit = async (data: any) => {
    await createBadge({ variables: { input: data } });
  };

  const handleEditNgoSubmit = async (data: EditNgoFormData) => {
    await updateNgo({ variables: { input: data } });
  };

  // --- Filters ---
  const upcomingEvents = ngo.events?.filter((event: Event) => {
    try {
      const eventDate = new Date(event.date);
      return isValid(eventDate) && eventDate > new Date();
    } catch { return false; }
  }) || [];

  const pastEvents = ngo.events?.filter((event: Event) => {
    try {
      const eventDate = new Date(event.date);
      return isValid(eventDate) && eventDate <= new Date();
    } catch { return false; }
  }) || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* --- Header Section --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          {/* Logo & Info */}
          <div className="flex items-start space-x-6 mb-4 lg:mb-0">
            {ngo.logoUrl ? (
              <img
                src={ngo.logoUrl}
                alt={ngo.name}
                className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 bg-blue-50 rounded-xl flex items-center justify-center border-4 border-white shadow-sm">
                <Building className="w-10 h-10 text-blue-600" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 truncate">{ngo.name}</h1>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditNgoModalOpen(true)} // Trigger Edit Modal
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium px-2 py-1 rounded-md hover:bg-blue-50"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>
              
              <p className="text-gray-600 text-lg mb-4 max-w-3xl leading-relaxed">
                {ngo.description}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Mail className="w-4 h-4 mr-2 text-blue-500" />
                  <span>{ngo.contactEmail}</span>
                </div>
                
                {ngo.website && (
                  <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Globe className="w-4 h-4 mr-2 text-green-500" />
                    <a 
                      href={ngo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors underline decoration-gray-300 hover:decoration-blue-600"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                  <span>{ngo.events?.length || 0} Events</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Box */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50/80 rounded-xl p-4 border border-gray-100 min-w-[300px] lg:ml-6 shrink-0">
            <div className="text-center p-2">
              <div className="text-2xl font-bold text-gray-900">{ngo.events?.length || 0}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Total Events</div>
            </div>
            <div className="text-center p-2 border-l border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{ngo.badges?.length || 0}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Badges</div>
            </div>
            <div className="text-center p-2 border-l border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{ngo.branches?.length || 0}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Branches</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Tab Navigation --- */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: 'events', label: 'Events', icon: Calendar, count: ngo.events?.length },
            { id: 'badges', label: 'Badges', icon: Award, count: ngo.badges?.length },
            { id: 'branches', label: 'Branches', icon: MapPin, count: ngo.branches?.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`
                -ml-0.5 mr-2 h-5 w-5
                ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
              `} />
              {tab.label}
              <span className={`
                ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block hidden
                ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'}
              `}>
                {tab.count || 0}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* --- Tab Content --- */}
      <div className="space-y-6 min-h-[400px]">
        
        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {isAdmin && (
               <div className="flex justify-end">
                 <button 
                   onClick={() => setIsAddEventModalOpen(true)} 
                   className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                 >
                   <Plus className="w-4 h-4 mr-2" /> Add Event
                 </button>
               </div>
            )}
            
            {/* Upcoming */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                Upcoming Events
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onSignUp={onEventSignUp}
                      onCancel={onEventCancel}
                      userSignups={userSignups}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No upcoming events scheduled.</p>
              )}
            </div>

            {/* Past */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                  Past Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {ngo.events?.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Events Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">Get started by creating your first event to engage with volunteers.</p>
                {isAdmin && (
                  <button 
                    onClick={() => setIsAddEventModalOpen(true)} 
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Create Event
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="animate-in fade-in duration-300">
            {isAdmin && (
               <div className="flex justify-end mb-6">
                 <button 
                   onClick={() => setIsAddBadgeModalOpen(true)} 
                   className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors shadow-sm"
                 >
                   <Plus className="w-4 h-4 mr-2" /> Create Badge
                 </button>
               </div>
            )}
            
            {ngo.badges && ngo.badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ngo.badges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isAdmin={isAdmin} // Pass isAdmin to show template view
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Badges Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">Create badges to recognize and reward your volunteers' hard work.</p>
                {isAdmin && (
                  <button 
                    onClick={() => setIsAddBadgeModalOpen(true)} 
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    Create Badge
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <div className="animate-in fade-in duration-300">
            {isAdmin && (
              <div className="mb-6 flex justify-end">
                <button 
                  onClick={() => setIsAddBranchModalOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Branch
                </button>
              </div>
            )}

            {ngo.branches && ngo.branches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ngo.branches.map((branch) => (
                  <div key={branch.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow relative group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-md text-green-600">
                           <Building className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{branch.city}</h3>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400 pl-6">
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                          {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Branches Listed</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">Add your office locations to help volunteers find you.</p>
                {isAdmin && (
                  <button 
                    onClick={() => setIsAddBranchModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Add Your First Branch
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      <AddBranchModal 
        isOpen={isAddBranchModalOpen} 
        onClose={() => setIsAddBranchModalOpen(false)} 
        onSubmit={handleAddBranchSubmit} 
        loading={isAddingBranch} 
      />
      <AddEventModal 
        isOpen={isAddEventModalOpen} 
        onClose={() => setIsAddEventModalOpen(false)} 
        onSubmit={handleAddEventSubmit} 
        loading={isCreatingEvent} 
      />
      <AddBadgeModal 
        isOpen={isAddBadgeModalOpen} 
        onClose={() => setIsAddBadgeModalOpen(false)} 
        onSubmit={handleAddBadgeSubmit} 
        loading={isCreatingBadge} 
      />
      <EditNgoModal
        isOpen={isEditNgoModalOpen}
        onClose={() => setIsEditNgoModalOpen(false)}
        onSubmit={handleEditNgoSubmit}
        loading={isUpdatingNgo}
        currentNgo={ngo}
      />
    </div>
  );
};

export default NgoProfile;