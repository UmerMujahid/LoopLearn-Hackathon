const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('[Auth Service Test] Running basic auth utilities verification...');

// 1. Password hashing verification
const password = 'SecretPassword123!';
const salt = bcrypt.genSaltSync(10);
const hashed = bcrypt.hashSync(password, salt);
assert.strictEqual(bcrypt.compareSync(password, hashed), true, 'Password compare should succeed');
assert.strictEqual(bcrypt.compareSync('WrongPassword', hashed), false, 'Wrong password compare should fail');

// 2. JWT token signing and verification
const payload = { id: 'mock-user-id-123', email: 'test@foodloop.org', role: 'organization' };
const secret = 'test-secret-key-foodloop-2026';
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
const decoded = jwt.verify(token, secret);
assert.strictEqual(decoded.id, payload.id, 'Decoded user ID should match');
assert.strictEqual(decoded.role, payload.role, 'Decoded role should match');

console.log('✓ [Auth Service Test] All auth unit tests passed successfully!');
