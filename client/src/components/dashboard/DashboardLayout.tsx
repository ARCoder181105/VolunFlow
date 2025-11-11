import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 card">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 -m-6 mb-6 h-1 rounded-t-lg" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            {user?.role === 'NGO_ADMIN' 
              ? 'Manage your NGO and track volunteer engagement.'
              : 'Discover new opportunities and track your volunteering journey.'
            }
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;