const express = require('express');
const router = express.Router();
const { createLeaveRequest, getLeaveRequests, updateLeaveRequest, deleteLeaveRequest } = require('../controllers/leaveController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, createLeaveRequest);
router.get('/', authenticateToken, getLeaveRequests);
router.put('/:id', authenticateToken, authorizeRole('admin', 'manager'), updateLeaveRequest);
router.delete('/:id', authenticateToken, deleteLeaveRequest);

module.exports = router;
