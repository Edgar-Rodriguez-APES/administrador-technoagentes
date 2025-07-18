import { fetchAuthSession } from 'aws-amplify/auth';

const amplifyConfig = {
  Auth: {
    Cognito: {
      region: 'us-west-2',
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    }
  },
  API: {
    REST: {
      TechnoagentesAPI: {
        endpoint: process.env.NEXT_PUBLIC_API_URL,
        region: 'us-west-2', // Cambiado de 'us-east-1' a 'us-west-2' para coincidir con la región de la API
        customHeaders: async () => {
          try {
            const session = await fetchAuthSession();
            return {
              Authorization: session.tokens?.idToken?.toString() || '',
            };
          } catch (error) {
            console.error('Error getting auth token for API request:', error);
            return {};
          }
        },
      }
    }
  }
};

export default amplifyConfig;