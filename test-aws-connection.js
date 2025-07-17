const AWS = require('aws-sdk');

// Configurar la región
AWS.config.update({ region: 'us-east-1' });

// Crear un cliente S3
const s3 = new AWS.S3();

// Función para listar buckets
async function listBuckets() {
  try {
    console.log('Intentando conectar con AWS S3...');
    const data = await s3.listBuckets().promise();
    console.log('Conexión exitosa con AWS S3');
    console.log('Buckets disponibles:', data.Buckets.map(b => b.Name).join(', '));
    return true;
  } catch (error) {
    console.error('Error al conectar con AWS S3:', error.message);
    return false;
  }
}

// Ejecutar la prueba
listBuckets();