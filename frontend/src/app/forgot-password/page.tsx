'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
        <ForgotPasswordForm />
      </div>
    </MainLayout>
  );
}
