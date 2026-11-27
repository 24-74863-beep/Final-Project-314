// Table map: app records (camelCase) <-> MySQL columns (snake_case).
// Maps the app's records (camelCase) to MySQL columns (snake_case).
// Fields the app uses that are not listed here are kept in the table's `extra` JSON column.
module.exports = {
  customers:   { cols: { name: 'name', phone: 'phone', address: 'address', email: 'email', userId: 'user_id', createdAt: 'created_at' }, json: {}, bool: [] },
  users:       { cols: { role: 'role', name: 'name', username: 'username', passHash: 'pass_hash', phone: 'phone', customerId: 'customer_id', createdAt: 'created_at' }, json: {}, bool: [] },
  mechanics:   { cols: { name: 'name', phone: 'phone', skills: 'skills', createdAt: 'created_at' }, json: { skills: [] }, bool: [] },
  motorcycles: { cols: { customerId: 'customer_id', brand: 'brand', model: 'model', plate: 'plate', type: 'type', createdAt: 'created_at' }, json: {}, bool: [] },
  services:    { cols: { name: 'name', price: 'price', createdAt: 'created_at' }, json: {}, bool: [] },
  parts:       { cols: { name: 'name', price: 'price', stock: 'stock', createdAt: 'created_at' }, json: {}, bool: [] },
  repairs:     { cols: { motorcycleId: 'motorcycle_id', customerId: 'customer_id', problem: 'problem', mechanicId: 'mechanic_id', status: 'status', isEmergency: 'is_emergency', services: 'services', parts: 'parts', notes: 'notes', requested: 'requested', preferredDate: 'preferred_date', createdAt: 'created_at', updatedAt: 'updated_at' }, json: { services: [], parts: [] }, bool: ['isEmergency', 'requested'] },
  emergencies: { cols: { customerId: 'customer_id', contactName: 'contact_name', phone: 'phone', motorcycleId: 'motorcycle_id', motoInfo: 'moto_info', location: 'location', problem: 'problem', urgency: 'urgency', status: 'status', mechanicId: 'mechanic_id', repairId: 'repair_id', createdAt: 'created_at' }, json: {}, bool: [] },
  payments:    { cols: { repairId: 'repair_id', amount: 'amount', method: 'method', date: 'date', note: 'note', createdAt: 'created_at' }, json: {}, bool: [] }
};
// Parent tables first: use this order for inserts and the reverse order for deletes.
module.exports.ORDER = ['customers', 'users', 'mechanics', 'motorcycles', 'services', 'parts', 'repairs', 'emergencies', 'payments'];
