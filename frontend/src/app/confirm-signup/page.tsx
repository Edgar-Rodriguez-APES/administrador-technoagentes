'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConfirmSignupForm from '@/components/auth/ConfirmSignupForm';

export default function ConfirmSignupPage() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
        <ConfirmSignupForm />
      </div>
    </MainLayout>
  );
}
