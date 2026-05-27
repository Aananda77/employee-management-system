const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRole('admin', 'manager'), createAnnouncement);
router.get('/', authenticateToken, getAnnouncements);
router.put('/:id', authenticateToken, authorizeRole('admin', 'manager'), updateAnnouncement);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'manager'), deleteAnnouncement);

module.exports = router;
