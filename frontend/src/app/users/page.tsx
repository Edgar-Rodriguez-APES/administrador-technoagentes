'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserService, ApiErrorType } from '@/services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'USER',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener usuarios desde la API
      const apiUsers = await UserService.getUsers();

      // Mapear los datos de la API al formato que espera nuestro componente
      const formattedUsers: User[] = apiUsers.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status || 'ACTIVE',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt
      }));

      setUsers(formattedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);

      // Si la API aún no está disponible, usar datos de demostración
      if (err.type === ApiErrorType.NETWORK_ERROR || err.type === ApiErrorType.NOT_FOUND) {
        const mockUsers: User[] = [
          {
            id: 'user-001',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: '2023-01-01T00:00:00Z',
          },
          {
            id: 'user-002',
            email: 'usuario1@example.com',
            firstName: 'Usuario',
            lastName: 'Uno',
            role: 'USER',
            status: 'ACTIVE',
            createdAt: '2023-01-02T00:00:00Z',
          }
        ];

        setUsers(mockUsers);
        setError('Usando datos de demostración: La API no está disponible');
      } else {
        setError(err.message || 'Error al obtener los usuarios');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      // Crear usuario a través de la API
      const userData = {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        sendInvitation: true
      };

      const createdUser = await UserService.createUser(userData);

      // Mapear el usuario creado al formato que espera nuestro componente
      const formattedUser: User = {
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: createdUser.role,
        status: createdUser.status || 'ACTIVE',
        createdAt: createdUser.createdAt || new Date().toISOString(),
        updatedAt: createdUser.updatedAt
      };

      setUsers([...users, formattedUser]);
      setShowAddUserModal(false);
      setNewUser({
        email: '',
        firstName: '',
        lastName: '',
        role: 'USER',
      });
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Eliminar usuario a través de la API
      await UserService.deleteUser(userId);

      // Actualizar la lista de usuarios
      setUsers(users.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Error al eliminar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Agregar Usuario
              </button>
            </div>
          </div>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
            <div className="py-4">
              {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  {error}
                </div>
              )}

              <div className="flex flex-col mt-8">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                            >
                              Nombre
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Rol
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Estado
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Fecha de Creación
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Acciones</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {isLoading ? (
                            <tr>
                              <td colSpan={6} className="px-3 py-4 text-sm text-center text-gray-500">
                                Cargando usuarios...
                              </td>
                            </tr>
                          ) : users.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-3 py-4 text-sm text-center text-gray-500">
                                No hay usuarios para mostrar
                              </td>
                            </tr>
                          ) : (
                            users.map((user) => (
                              <tr key={user.id}>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6">
                                  {user.firstName} {user.lastName}
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {user.email}
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                      user.role === 'ADMIN'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                      user.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAddUserModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Agregar Usuario</h3>
                    <div className="mt-2">
                      <form onSubmit={handleAddUser}>
                        <div className="mb-4">
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            Nombre
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Apellido
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Rol
                          </label>
                          <select
                            id="role"
                            name="role"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="USER">Usuario</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                          <button
                            type="submit"
                            className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddUserModal(false)}
                            className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </ProtectedRoute>
  );
}
