const { query } = require('../config/database');

const getAdminDashboard = async (req, res) => {
    try {
        const [totalEmployees] = await query('SELECT COUNT(*) as count FROM employees');
        const [totalManagers] = await query('SELECT COUNT(*) as count FROM managers');
        const [totalTeams] = await query('SELECT COUNT(*) as count FROM teams');
        const [pendingLeaves] = await query("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'");
        const [completedTasks] = await query("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
        const [totalTasks] = await query('SELECT COUNT(*) as count FROM tasks');

        const [taskStats] = await query(`
            SELECT status, COUNT(*) as count 
            FROM tasks 
            GROUP BY status
        `);

        const [attendanceStats] = await query(`
            SELECT status, COUNT(*) as count 
            FROM attendance 
            WHERE date >= date('now', '-7 days')
            GROUP BY status
        `);

        const [recentLeaves] = await query(`
            SELECT lr.*, u.username, 
                   CASE WHEN u.role = 'manager' THEN m.full_name WHEN u.role = 'employee' THEN e.full_name ELSE NULL END as full_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN managers m ON u.id = m.user_id
            LEFT JOIN employees e ON u.id = e.user_id
            ORDER BY lr.created_at DESC
            LIMIT 10
        `);

        const [recentTasks] = await query(`
            SELECT t.*, u.username as assigned_to_username
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            ORDER BY t.created_at DESC
            LIMIT 10
        `);

        res.json({
            stats: {
                totalEmployees: totalEmployees[0].count,
                totalManagers: totalManagers[0].count,
                totalTeams: totalTeams[0].count,
                pendingLeaves: pendingLeaves[0].count,
                completedTasks: completedTasks[0].count,
                totalTasks: totalTasks[0].count
            },
            taskStats,
            attendanceStats,
            recentLeaves,
            recentTasks
        });
    } catch (error) {
        console.error('Get admin dashboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getManagerDashboard = async (req, res) => {
    try {
        const [managerData] = await query('SELECT * FROM managers WHERE user_id = ?', [req.user.id]);
        if (managerData.length === 0) {
            return res.status(404).json({ message: 'Manager profile not found' });
        }

        const manager = managerData[0];
        let teamEmployees = [];
        let teamData = null;

        if (manager.team_id) {
            const [team] = await query('SELECT * FROM teams WHERE id = ?', [manager.team_id]);
            if (team.length > 0) {
                teamData = team[0];
            }

            const [employees] = await query(`
                SELECT e.*, u.username, u.email
                FROM employees e
                JOIN users u ON e.user_id = u.id
                WHERE e.team_id = ?
            `, [manager.team_id]);
            teamEmployees = employees;
        }

        const [assignedTasks] = await query(`
            SELECT t.*, u.username as assigned_to_username
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.team_id = ? OR t.assigned_to = ?
            ORDER BY t.created_at DESC
            LIMIT 10
        `, [manager.team_id, req.user.id]);

        const [pendingLeaves] = await query(`
            SELECT lr.*, u.username, e.full_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN employees e ON u.id = e.user_id
            WHERE e.team_id = ? AND lr.status = 'pending'
            ORDER BY lr.created_at DESC
        `, [manager.team_id]);

        const [recentAttendance] = await query(`
            SELECT a.*, u.username, e.full_name
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN employees e ON u.id = e.user_id
            WHERE e.team_id = ? OR a.user_id = ?
            ORDER BY a.date DESC
            LIMIT 10
        `, [manager.team_id, req.user.id]);

        res.json({
            manager,
            team: teamData,
            teamEmployees,
            assignedTasks,
            pendingLeaves,
            recentAttendance
        });
    } catch (error) {
        console.error('Get manager dashboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getEmployeeDashboard = async (req, res) => {
    try {
        const [employeeData] = await query('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
        if (employeeData.length === 0) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const employee = employeeData[0];
        let teamData = null;
        let managerData = null;

        if (employee.team_id) {
            const [team] = await query('SELECT * FROM teams WHERE id = ?', [employee.team_id]);
            if (team.length > 0) {
                teamData = team[0];
            }
        }

        if (employee.manager_id) {
            const [manager] = await query(`
                SELECT m.*, u.username, u.email
                FROM managers m
                JOIN users u ON m.user_id = u.id
                WHERE m.id = ?
            `, [employee.manager_id]);
            if (manager.length > 0) {
                managerData = manager[0];
            }
        }

        const [assignedTasks] = await query(`
            SELECT t.*, u.username as assigned_by_username
            FROM tasks t
            LEFT JOIN users u ON t.assigned_by = u.id
            WHERE t.assigned_to = ?
            ORDER BY t.created_at DESC
        `, [req.user.id]);

        const [attendanceHistory] = await query(`
            SELECT * FROM attendance
            WHERE user_id = ?
            ORDER BY date DESC
            LIMIT 30
        `, [req.user.id]);

        const [leaveHistory] = await query(`
            SELECT * FROM leave_requests
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [req.user.id]);

        res.json({
            employee,
            team: teamData,
            manager: managerData,
            assignedTasks,
            attendanceHistory,
            leaveHistory
        });
    } catch (error) {
        console.error('Get employee dashboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAdminDashboard,
    getManagerDashboard,
    getEmployeeDashboard
};
