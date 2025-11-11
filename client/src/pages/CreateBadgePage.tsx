import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { ArrowLeft } from 'lucide-react';
import { CREATE_BADGE_TEMPLATE_MUTATION } from '../graphql/mutations/badge.mutations';
import { MY_NGO_QUERY } from '../graphql/queries/ngo.queries';
import BadgeForm from '../components/badges/BadgeForm';
import { useAuth } from '../hooks/useAuth';

const CreateBadgePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [createBadge, { loading }] = useMutation(CREATE_BADGE_TEMPLATE_MUTATION, {
    refetchQueries: [MY_NGO_QUERY],
    onCompleted: () => {
      navigate('/ngo?view=my-ngo');
    },
  });

  const handleCreateBadge = async (input: any) => {
    try {
      await createBadge({ variables: { input } });
    } catch (error) {
      console.error('Error creating badge:', error);
      throw error;
    }
  };

  if (user?.role !== 'NGO_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only NGO administrators can create badges.</p>
          <button onClick={() => navigate('/ngo')} className="btn-primary">
            Back to NGOs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/ngo?view=my-ngo')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My NGO
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Badge</h1>
              <p className="text-gray-600">
                Design a new badge to recognize and reward your volunteers' achievements.
              </p>
            </div>
            
            <BadgeForm
              onSubmit={handleCreateBadge}
              loading={loading}
              mode="create"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBadgePage;