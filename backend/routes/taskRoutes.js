const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask, submitTask } = require('../controllers/taskController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authenticateToken, upload.single('attachment'), createTask);
router.get('/', authenticateToken, getTasks);
router.get('/:id', authenticateToken, getTaskById);
router.put('/:id', authenticateToken, updateTask);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'manager'), deleteTask);
router.post('/:id/submit', authenticateToken, upload.single('submission_file'), submitTask);

module.exports = router;
