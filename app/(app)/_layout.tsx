import React from 'react';
import { Slot } from 'expo-router';
import ProtectedRoute from '../../src/components/ProtectedRoute';

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Slot />
    </ProtectedRoute>
  );
}
