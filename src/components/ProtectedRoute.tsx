import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

/** Renders children only for an authenticated AND authorized session. Covers direct URL loads and refreshes. */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === 'initializing') return <LoadingScreen label="Restoring your session…" />;
  if (status !== 'authenticated') return <Redirect href="/" />;
  return <>{children}</>;
}
