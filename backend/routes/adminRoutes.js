const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');

// Admin routes
router.post('/users', authMiddleware, roleMiddleware('admin'), registerUser);
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);
router.put('/users/:id', authMiddleware, roleMiddleware('admin'), updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

module.exports = router;