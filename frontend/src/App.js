import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { Header, Home, Users, Auth, Sign, Profile, Update, ErrorBoundary } from './components';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoadingProvider>
          <ErrorBoundary>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sign" element={<Sign />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:id" element={<Profile />} />
              <Route path="/users/:id/update" element={<Update />} />
            </Routes>
          </ErrorBoundary>
        </LoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

