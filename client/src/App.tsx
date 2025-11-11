import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { AuthProvider } from './hooks/useAuth';
import { client } from './graphql/client';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import NGOPage from './pages/NGOPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EventDetailsPage from './pages/EventDetailsPage';
import CreateBadgePage from './pages/CreateBadgePage';
import NgoDetailsPage from './pages/NgoDetailsPage';
import './styles/globals.css';

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/badges/create"
                  element={
                    <ProtectedRoute>
                      <CreateBadgePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:eventId"
                  element={
                    <ProtectedRoute>
                      <EventDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ngo"
                  element={
                    <ProtectedRoute>
                      <NGOPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/ngo/:slug" element={<ProtectedRoute><NgoDetailsPage /></ProtectedRoute>} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;