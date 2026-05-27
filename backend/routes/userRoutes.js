const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser, updateProfile } = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticateToken, getAllUsers);
router.post('/', authenticateToken, authorizeRole('admin'), createUser);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateUser);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteUser);
router.put('/profile', authenticateToken, upload.single('profile_photo'), updateProfile);

module.exports = router;
