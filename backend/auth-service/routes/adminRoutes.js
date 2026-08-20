const express = require('express');
const { getUsers, verifyOrganization } = require('../controllers/adminController');
const { verifyToken, authorize, isAdmin } = require('../middleware/auth')
const router = express.Router();

router.use(verifyToken, isAdmin);

router.get('/users', getUsers);
router.put('/verify/:id', verifyOrganization);

module.exports = router;