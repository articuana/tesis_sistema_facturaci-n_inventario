const invoiceModel = {
  table: 'invoices',
  fields: ['id', 'invoice_number', 'customer_name', 'customer_type', 'customer_identification', 'customer_address', 'customer_email', 'customer_phone', 'subtotal', 'tax', 'total', 'created_at', 'is_visible']
};

export default invoiceModel;
