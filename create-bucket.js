const AWS = require('aws-sdk');

// Configurar la región
AWS.config.update({ region: 'us-west-2' });

// Crear un cliente S3
const s3 = new AWS.S3();

// Función para crear un bucket
async function createBucket() {
  try {
    console.log('Intentando crear el bucket mi-bucket-personalizado-dev...');
    const data = await s3.createBucket({
      Bucket: 'mi-bucket-personalizado-dev',
      CreateBucketConfiguration: {
        LocationConstraint: 'us-west-2'
      }
    }).promise();
    console.log('Bucket creado exitosamente:', data.Location);
    return true;
  } catch (error) {
    console.error('Error al crear el bucket:', error.message);
    return false;
  }
}

// Ejecutar la creación del bucket
createBucket();