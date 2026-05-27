const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getAttendanceStats } = require('../controllers/attendanceController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, markAttendance);
router.get('/', authenticateToken, getAttendance);
router.get('/stats', authenticateToken, getAttendanceStats);

module.exports = router;
