import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import VolunteerDashboard from '../components/dashboard/VolunteerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      {user?.role === 'NGO_ADMIN' ? <AdminDashboard /> : <VolunteerDashboard />}
    </DashboardLayout>
  );
};

export default DashboardPage;