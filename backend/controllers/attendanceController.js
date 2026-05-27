const { query, run } = require('../config/database');

const markAttendance = async (req, res) => {
    try {
        const { user_id, date, status } = req.body;
        const markedBy = req.user.id;

        const [existing] = await query(
            'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
            [user_id, date]
        );

        if (existing.length > 0) {
            await run(
                'UPDATE attendance SET status = ?, marked_by = ? WHERE user_id = ? AND date = ?',
                [status, markedBy, user_id, date]
            );
        } else {
            await run(
                'INSERT INTO attendance (user_id, date, status, marked_by) VALUES (?, ?, ?, ?)',
                [user_id, date, status, markedBy]
            );
        }

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAttendance = async (req, res) => {
    try {
        const { user_id, start_date, end_date, team_id } = req.query;
        let sql = `
            SELECT a.*, u.username, u.email,
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
                   mu.username as marked_by_username
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN managers m ON u.id = m.user_id
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN users mu ON a.marked_by = mu.id
            WHERE 1=1
        `;
        const params = [];

        if (req.user.role === 'manager') {
            const [managerData] = await query('SELECT * FROM managers WHERE user_id = ?', [req.user.id]);
            if (managerData.length > 0 && managerData[0].team_id) {
                sql += ' AND (m.team_id = ? OR e.team_id = ? OR a.user_id = ?)';
                params.push(managerData[0].team_id, managerData[0].team_id, req.user.id);
            } else {
                sql += ' AND a.user_id = ?';
                params.push(req.user.id);
            }
        } else if (req.user.role === 'employee') {
            sql += ' AND a.user_id = ?';
            params.push(req.user.id);
        }

        if (user_id) {
            sql += ' AND a.user_id = ?';
            params.push(user_id);
        }

        if (team_id) {
            sql += ' AND (m.team_id = ? OR e.team_id = ?)';
            params.push(team_id, team_id);
        }

        if (start_date) {
            sql += ' AND a.date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            sql += ' AND a.date <= ?';
            params.push(end_date);
        }

        sql += ' ORDER BY a.date DESC';

        const [attendance] = await query(sql, params);
        res.json({ attendance });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAttendanceStats = async (req, res) => {
    try {
        const { user_id, team_id, month, year } = req.query;
        let sql = `
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
                user_id
            FROM attendance
            WHERE 1=1
        `;
        const params = [];

        if (user_id) {
            sql += ' AND user_id = ?';
            params.push(user_id);
        }

        if (month) {
            sql += ' AND strftime("%m", date) = ?';
            params.push(month.toString().padStart(2, '0'));
        }

        if (year) {
            sql += ' AND strftime("%Y", date) = ?';
            params.push(year.toString());
        }

        if (team_id && !user_id) {
            sql += ' AND user_id IN (SELECT user_id FROM managers WHERE team_id = ? UNION SELECT user_id FROM employees WHERE team_id = ?)';
            params.push(team_id, team_id);
        }

        sql += ' GROUP BY user_id';

        const [stats] = await query(sql, params);
        res.json({ stats });
    } catch (error) {
        console.error('Get attendance stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    markAttendance,
    getAttendance,
    getAttendanceStats
};
