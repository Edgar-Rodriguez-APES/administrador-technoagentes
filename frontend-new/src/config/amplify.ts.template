import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
        region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
        loginWith: {
          email: true,
        },
      },
    },
    API: {
      REST: {
        TechnoagentesAPI: {
          endpoint: process.env.NEXT_PUBLIC_API_URL || '',
          region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
          // Configuración para adjuntar tokens de autenticación a las solicitudes
          customHeaders: async () => {
            try {
              // Esta función se ejecutará antes de cada solicitud a la API
              return {
                Authorization: `Bearer ${(await Amplify.Auth.fetchAuthSession()).tokens?.idToken?.toString()}`,
              };
            } catch (error) {
              console.error('Error al obtener el token de autenticación:', error);
              return {};
            }
          },
        },
      },
    },
  });
}
