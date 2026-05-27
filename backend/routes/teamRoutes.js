const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam } = require('../controllers/teamController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRole('admin'), createTeam);
router.get('/', authenticateToken, getAllTeams);
router.get('/:id', authenticateToken, getTeamById);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateTeam);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteTeam);

module.exports = router;
