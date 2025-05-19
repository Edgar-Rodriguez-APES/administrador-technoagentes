import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { fetchAuthSession } from 'aws-amplify/auth';

// Configuración de AWS Amplify
const amplifyConfig = {
  Auth: {
    Cognito: {
      // Región de AWS donde se encuentra el User Pool de Cognito
      region: 'us-east-1',
      // User Pool ID
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_9B9Zc4NvW',
      // User Pool Web Client ID
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '5n9mf61k09u3vq4qgvgtcdj15k',
    }
  },
  API: {
    REST: {
      TechnoagentesAPI: {
        endpoint: process.env.NEXT_PUBLIC_API_URL || 'https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev',
        region: 'us-east-1',
        // Configuración para adjuntar tokens de autenticación a las solicitudes
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

// Inicializar Amplify con la configuración
const configureAmplify = () => {
  Amplify.configure(amplifyConfig);

  // Configurar el proveedor de tokens para las solicitudes a la API
  cognitoUserPoolsTokenProvider.setKeyValueStorage({
    getItem: async (key: string) => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          return session.tokens.idToken.toString();
        }
        return null;
      } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
      }
    },
    removeItem: async () => {},
    setItem: async () => {},
  });
};

export default configureAmplify;
