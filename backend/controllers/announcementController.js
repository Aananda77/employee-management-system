const { query, run } = require('../config/database');

const createAnnouncement = async (req, res) => {
    try {
        const { title, content, visibility, team_id } = req.body;

        const result = await run(
            'INSERT INTO announcements (title, content, created_by, visibility, team_id) VALUES (?, ?, ?, ?, ?)',
            [title, content, req.user.id, visibility, team_id]
        );

        res.status(201).json({
            message: 'Announcement created successfully',
            announcement: { id: result.insertId, title, content, visibility, team_id }
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const { visibility, team_id } = req.query;
        let sql = `
            SELECT a.*, u.username as created_by_username, tm.team_name
            FROM announcements a
            LEFT JOIN users u ON a.created_by = u.id
            LEFT JOIN teams tm ON a.team_id = tm.id
            WHERE 1=1
        `;
        const params = [];

        if (req.user.role === 'manager') {
            const [managerData] = await query('SELECT * FROM managers WHERE user_id = ?', [req.user.id]);
            if (managerData.length > 0 && managerData[0].team_id) {
                sql += ` AND (
                    a.visibility = 'all' 
                    OR a.visibility = 'managers'
                    OR (a.visibility = 'team' AND a.team_id = ?)
                )`;
                params.push(managerData[0].team_id);
            } else {
                sql += " AND (a.visibility = 'all' OR a.visibility = 'managers')";
            }
        } else if (req.user.role === 'employee') {
            const [employeeData] = await query('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
            if (employeeData.length > 0 && employeeData[0].team_id) {
                sql += ` AND (
                    a.visibility = 'all' 
                    OR a.visibility = 'employees'
                    OR (a.visibility = 'team' AND a.team_id = ?)
                )`;
                params.push(employeeData[0].team_id);
            } else {
                sql += " AND (a.visibility = 'all' OR a.visibility = 'employees')";
            }
        }

        if (visibility) {
            sql += ' AND a.visibility = ?';
            params.push(visibility);
        }

        if (team_id) {
            sql += ' AND a.team_id = ?';
            params.push(team_id);
        }

        sql += ' ORDER BY a.created_at DESC';

        const [announcements] = await query(sql, params);
        res.json({ announcements });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, visibility, team_id } = req.body;

        const [announcements] = await query('SELECT * FROM announcements WHERE id = ?', [id]);
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        await run(
            'UPDATE announcements SET title = ?, content = ?, visibility = ?, team_id = ? WHERE id = ?',
            [title, content, visibility, team_id, id]
        );

        res.json({ message: 'Announcement updated successfully' });
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const [announcements] = await query('SELECT * FROM announcements WHERE id = ?', [id]);
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        await run('DELETE FROM announcements WHERE id = ?', [id]);

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
};
