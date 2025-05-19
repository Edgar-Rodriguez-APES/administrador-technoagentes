import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// Hook personalizado para interactuar con la API
export const useApi = (apiName: string = 'TechnoagentesAPI') => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Función para realizar una petición GET
  const get = async (path: string, options: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.get(apiName, path, options);
      return response;
    } catch (error) {
      console.error(`Error in GET request to ${path}:`, error);
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para realizar una petición POST
  const post = async (path: string, options: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.post(apiName, path, options);
      return response;
    } catch (error) {
      console.error(`Error in POST request to ${path}:`, error);
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para realizar una petición PUT
  const put = async (path: string, options: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.put(apiName, path, options);
      return response;
    } catch (error) {
      console.error(`Error in PUT request to ${path}:`, error);
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para realizar una petición DELETE
  const del = async (path: string, options: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.del(apiName, path, options);
      return response;
    } catch (error) {
      console.error(`Error in DELETE request to ${path}:`, error);
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    get,
    post,
    put,
    del,
    isLoading,
    error,
  };
};
