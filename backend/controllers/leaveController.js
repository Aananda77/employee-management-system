const { query, run } = require('../config/database');

const createLeaveRequest = async (req, res) => {
    try {
        const { reason, leave_type, start_date, end_date } = req.body;

        const result = await run(
            'INSERT INTO leave_requests (user_id, reason, leave_type, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, reason, leave_type, start_date, end_date]
        );

        res.status(201).json({
            message: 'Leave request submitted successfully',
            leaveRequest: { id: result.insertId, reason, leave_type, start_date, end_date }
        });
    } catch (error) {
        console.error('Create leave request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getLeaveRequests = async (req, res) => {
    try {
        const { status, user_id, team_id } = req.query;
        let sql = `
            SELECT lr.*,
                   u.username, u.email,
                   CASE
                       WHEN u.role = 'manager' THEN m.full_name
                       WHEN u.role = 'employee' THEN e.full_name
                       ELSE NULL
                   END as full_name,
                   CASE
                       WHEN u.role = 'manager' THEN m.team_id
                       WHEN u.role = 'employee' THEN e.team_id
                       ELSE NULL
                   END as team_id,
                   ru.username as reviewed_by_username
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN managers m ON u.id = m.user_id
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN users ru ON lr.reviewed_by = ru.id
            WHERE 1=1
        `;
        const params = [];

        if (req.user.role === 'manager') {
            const [managerData] = await query('SELECT * FROM managers WHERE user_id = ?', [req.user.id]);
            if (managerData.length > 0 && managerData[0].team_id) {
                sql += ' AND (m.team_id = ? OR e.team_id = ? OR lr.user_id = ?)';
                params.push(managerData[0].team_id, managerData[0].team_id, req.user.id);
            } else {
                sql += ' AND lr.user_id = ?';
                params.push(req.user.id);
            }
        } else if (req.user.role === 'employee') {
            sql += ' AND lr.user_id = ?';
            params.push(req.user.id);
        }

        if (status) {
            sql += ' AND lr.status = ?';
            params.push(status);
        }

        if (user_id) {
            sql += ' AND lr.user_id = ?';
            params.push(user_id);
        }

        if (team_id) {
            sql += ' AND (m.team_id = ? OR e.team_id = ?)';
            params.push(team_id, team_id);
        }

        sql += ' ORDER BY lr.created_at DESC';

        const [leaveRequests] = await query(sql, params);
        res.json({ leaveRequests });
    } catch (error) {
        console.error('Get leave requests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const [requests] = await query('SELECT * FROM leave_requests WHERE id = ?', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        await run(
            'UPDATE leave_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.user.id, id]
        );

        res.json({ message: 'Leave request updated successfully' });
    } catch (error) {
        console.error('Update leave request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const [requests] = await query('SELECT * FROM leave_requests WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (requests.length === 0) {
            return res.status(404).json({ message: 'Leave request not found or not authorized' });
        }

        await run('DELETE FROM leave_requests WHERE id = ?', [id]);

        res.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
        console.error('Delete leave request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createLeaveRequest,
    getLeaveRequests,
    updateLeaveRequest,
    deleteLeaveRequest
};
