'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
        <ResetPasswordForm />
      </div>
    </MainLayout>
  );
}
