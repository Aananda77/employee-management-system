const { query, run } = require('../config/database');

const createTeam = async (req, res) => {
    try {
        const { team_name, team_code, team_description } = req.body;

        const [existingTeams] = await query(
            'SELECT id FROM teams WHERE team_code = ?',
            [team_code]
        );

        if (existingTeams.length > 0) {
            return res.status(400).json({ message: 'Team code already exists' });
        }

        const result = await run(
            'INSERT INTO teams (team_name, team_code, team_description, created_by) VALUES (?, ?, ?, ?)',
            [team_name, team_code, team_description, req.user.id]
        );

        res.status(201).json({
            message: 'Team created successfully',
            team: { id: result.insertId, team_name, team_code, team_description }
        });
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllTeams = async (req, res) => {
    try {
        let sql = 'SELECT t.*, u.username as created_by_username FROM teams t LEFT JOIN users u ON t.created_by = u.id';
        const params = [];

        const [teams] = await query(sql, params);

        for (let team of teams) {
            const [managers] = await query(
                'SELECT m.*, u.username, u.email FROM managers m JOIN users u ON m.user_id = u.id WHERE m.team_id = ?',
                [team.id]
            );
            const [employees] = await query(
                'SELECT e.*, u.username, u.email FROM employees e JOIN users u ON e.user_id = u.id WHERE e.team_id = ?',
                [team.id]
            );
            team.managers = managers;
            team.employees = employees;
        }

        res.json({ teams });
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const [teams] = await query(
            'SELECT t.*, u.username as created_by_username FROM teams t LEFT JOIN users u ON t.created_by = u.id WHERE t.id = ?',
            [id]
        );

        if (teams.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const team = teams[0];
        const [managers] = await query(
            'SELECT m.*, u.username, u.email FROM managers m JOIN users u ON m.user_id = u.id WHERE m.team_id = ?',
            [team.id]
        );
        const [employees] = await query(
            'SELECT e.*, u.username, u.email FROM employees e JOIN users u ON e.user_id = u.id WHERE e.team_id = ?',
            [team.id]
        );
        team.managers = managers;
        team.employees = employees;

        res.json({ team });
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { team_name, team_code, team_description } = req.body;

        const [teams] = await query('SELECT * FROM teams WHERE id = ?', [id]);
        if (teams.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        await run(
            'UPDATE teams SET team_name = ?, team_code = ?, team_description = ? WHERE id = ?',
            [team_name, team_code, team_description, id]
        );

        res.json({ message: 'Team updated successfully' });
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;

        const [teams] = await query('SELECT * FROM teams WHERE id = ?', [id]);
        if (teams.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        await run('DELETE FROM teams WHERE id = ?', [id]);

        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam
};
