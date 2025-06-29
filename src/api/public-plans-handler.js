/**
 * Public Plans API Handler
 * 
 * This handler provides public access to available service plans
 * for the frontend registration form.
 */

/**
 * Handler for the GET /public/plans endpoint
 * @param {Object} event - API Gateway event
 * @returns {Object} - API Gateway response
 */
exports.handler = async (event) => {
  try {
    // Define available plans
    const plans = [
      {
        id: 'BASIC',
        name: 'Plan Básico',
        description: 'Perfecto para equipos pequeños que están comenzando',
        price: 29.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Hasta 5 usuarios',
          '10 agentes IA incluidos',
          'Soporte por email',
          'Dashboard básico'
        ]
      },
      {
        id: 'STANDARD',
        name: 'Plan Estándar',
        description: 'Ideal para equipos en crecimiento',
        price: 79.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Hasta 25 usuarios',
          '50 agentes IA incluidos',
          'Soporte prioritario',
          'Dashboard avanzado',
          'Integraciones API'
        ],
        popular: true
      },
      {
        id: 'PREMIUM',
        name: 'Plan Premium',
        description: 'Para empresas que necesitan máximo rendimiento',
        price: 199.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Usuarios ilimitados',
          'Agentes IA ilimitados',
          'Soporte 24/7',
          'Dashboard empresarial',
          'Integraciones avanzadas',
          'Análisis personalizado'
        ]
      }
    ];

    return formatResponse(200, {
      plans,
      currency: 'USD',
      interval: 'month'
    });
  } catch (error) {
    console.error('Error in public plans handler:', error);
    
    return formatResponse(500, {
      message: 'Error retrieving plans'
    });
  }
};

/**
 * Format API Gateway response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} - Formatted API Gateway response
 */
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
}