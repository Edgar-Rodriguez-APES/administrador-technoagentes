'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
        <RegisterForm />
      </div>
    </MainLayout>
  );
}
