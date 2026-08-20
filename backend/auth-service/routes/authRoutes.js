const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken, authorize } = require('../middleware/auth')
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

const verifyRole = authorize('provider', 'organization', 'admin');

router.get('/profile', verifyToken, verifyRole, getProfile);
router.put('/profile', verifyToken, verifyRole, updateProfile);

module.exports = router;