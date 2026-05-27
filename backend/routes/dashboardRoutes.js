const express = require('express');
const router = express.Router();
const { getAdminDashboard, getManagerDashboard, getEmployeeDashboard } = require('../controllers/dashboardController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/admin', authenticateToken, authorizeRole('admin'), getAdminDashboard);
router.get('/manager', authenticateToken, authorizeRole('manager'), getManagerDashboard);
router.get('/employee', authenticateToken, authorizeRole('employee'), getEmployeeDashboard);

module.exports = router;
