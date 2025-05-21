'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserService, ApiErrorType, User, CreateUserRequest } from '@/services/api';

// Componente para la tabla de usuarios
const UsersTable: React.FC<{ users: User[]; onEdit: (user: User) => void; onDelete: (userId: string) => void }> = ({ 
  users, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(user)}
                  className="text-primary hover:text-primary-dark mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Componente para el formulario de usuario
const UserForm: React.FC<{
  user: Partial<User>;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ user, onChange, onSubmit, onCancel, isLoading }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {user.id ? 'Editar Usuario' : 'Crear Usuario'}
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={user.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            disabled={!!user.id || isLoading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            value={user.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Rol
          </label>
          <select
            id="role"
            value={user.role || 'User'}
            onChange={(e) => onChange('role', e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="User">Usuario</option>
            <option value="Admin">Administrador</option>
          </select>
        </div>
        {user.id && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="status"
              value={user.status || 'ACTIVE'}
              onChange={(e) => onChange('status', e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Página principal de usuarios
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para obtener usuarios
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedUsers = await UserService.getUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al cargar usuarios. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar cambios en el formulario
  const handleFormChange = (field: string, value: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para abrir el formulario de creación
  const handleAddUser = () => {
    setCurrentUser({
      role: 'User',
      status: 'ACTIVE',
    });
    setShowForm(true);
  };

  // Función para abrir el formulario de edición
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  // Función para cancelar el formulario
  const handleCancelForm = () => {
    setShowForm(false);
    setCurrentUser({});
  };

  // Función para guardar el usuario
  const handleSaveUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (currentUser.id) {
        // Actualizar usuario existente
        await UserService.updateUser(currentUser.id, {
          name: currentUser.name,
          role: currentUser.role,
          status: currentUser.status,
        });
      } else {
        // Crear nuevo usuario
        if (!currentUser.email || !currentUser.name || !currentUser.role) {
          setError('Por favor, completa todos los campos obligatorios');
          setIsLoading(false);
          return;
        }

        await UserService.createUser({
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
          sendInvitation: true,
        });
      }

      // Actualizar la lista de usuarios
      await fetchUsers();
      
      // Cerrar el formulario
      setShowForm(false);
      setCurrentUser({});
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      
      if (error.type === ApiErrorType.VALIDATION_ERROR) {
        setError('Error de validación. Por favor, verifica los datos ingresados.');
      } else if (error.type === ApiErrorType.CONFLICT) {
        setError('Ya existe un usuario con este email.');
      } else {
        setError('Error al guardar usuario. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para confirmar eliminación
  const handleDeleteConfirm = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleting(true);
  };

  // Función para eliminar usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await UserService.deleteUser(userToDelete);
      
      // Actualizar la lista de usuarios
      await fetchUsers();
      
      // Cerrar el diálogo de confirmación
      setIsDeleting(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar usuario. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cancelar eliminación
  const handleDeleteCancel = () => {
    setIsDeleting(false);
    setUserToDelete(null);
  };

  return (
    <ProtectedRoute requiredRole="Admin">
      <MainLayout>
        <div>
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <button
              onClick={handleAddUser}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nuevo Usuario
            </button>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario o tabla */}
          {showForm ? (
            <UserForm
              user={currentUser}
              onChange={handleFormChange}
              onSubmit={handleSaveUser}
              onCancel={handleCancelForm}
              isLoading={isLoading}
            />
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {isLoading && !users.length ? (
                <div className="flex justify-center items-center h-64">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : users.length > 0 ? (
                <UsersTable
                  users={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteConfirm}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No hay usuarios para mostrar</p>
                </div>
              )}
            </div>
          )}

          {/* Diálogo de confirmación de eliminación */}
          {isDeleting && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
                <p className="text-gray-500 mb-6">
                  ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Eliminando...
                      </>
                    ) : (
                      'Eliminar'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
