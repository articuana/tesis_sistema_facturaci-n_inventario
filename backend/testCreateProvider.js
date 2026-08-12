import { createProvider } from './services/providerService.js';
import { pool } from './config/database.js';

try {
  const provider = await createProvider({
    company: 'Test Provider','supplier_name': 'Prueba', product_type: 'Carnes', product_type_other: '', scheduled_day: 'Lunes', contact_phone: '0987654321', contact_mode: 'presencial'
  });
  console.log('Created provider:', provider);
} catch (error) {
  console.error('Create error:', error.message);
} finally {
  await pool.end();
}
