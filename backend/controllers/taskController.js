const { query, run } = require('../config/database');

const createTask = async (req, res) => {
    try {
        const { title, description, deadline, priority, assigned_to, assigned_to_role, team_id } = req.body;
        const attachment = req.file ? req.file.filename : null;

        const result = await run(
            'INSERT INTO tasks (title, description, deadline, priority, assigned_by, assigned_to, assigned_to_role, team_id, attachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, deadline, priority, req.user.id, assigned_to, assigned_to_role, team_id, attachment]
        );

        res.status(201).json({
            message: 'Task created successfully',
            task: { id: result.insertId, title, description, deadline, priority }
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getTasks = async (req, res) => {
    try {
        const { status, team_id, assigned_to } = req.query;
        let sql = `
            SELECT t.*,
                   u1.username as assigned_by_username,
                   u2.username as assigned_to_username,
                   tm.team_name
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_by = u1.id
            LEFT JOIN users u2 ON t.assigned_to = u2.id
            LEFT JOIN teams tm ON t.team_id = tm.id
            WHERE 1=1
        `;
        const params = [];

        if (req.user.role === 'manager') {
            const [managerData] = await query('SELECT * FROM managers WHERE user_id = ?', [req.user.id]);
            if (managerData.length > 0 && managerData[0].team_id) {
                sql += ' AND (t.team_id = ? OR t.assigned_to = ?)';
                params.push(managerData[0].team_id, req.user.id);
            } else {
                sql += ' AND t.assigned_to = ?';
                params.push(req.user.id);
            }
        } else if (req.user.role === 'employee') {
            sql += ' AND t.assigned_to = ?';
            params.push(req.user.id);
        }

        if (status) {
            sql += ' AND t.status = ?';
            params.push(status);
        }

        if (team_id) {
            sql += ' AND t.team_id = ?';
            params.push(team_id);
        }

        if (assigned_to) {
            sql += ' AND t.assigned_to = ?';
            params.push(assigned_to);
        }

        sql += ' ORDER BY t.created_at DESC';

        const [tasks] = await query(sql, params);
        res.json({ tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const [tasks] = await query(`
            SELECT t.*,
                   u1.username as assigned_by_username,
                   u2.username as assigned_to_username,
                   tm.team_name
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_by = u1.id
            LEFT JOIN users u2 ON t.assigned_to = u2.id
            LEFT JOIN teams tm ON t.team_id = tm.id
            WHERE t.id = ?
        `, [id]);

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const [submissions] = await query(`
            SELECT ts.*, u.username as submitted_by_username
            FROM task_submissions ts
            JOIN users u ON ts.submitted_by = u.id
            WHERE ts.task_id = ?
            ORDER BY ts.submitted_at DESC
        `, [id]);

        res.json({ task: tasks[0], submissions });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, deadline, priority, status, assigned_to, assigned_to_role, team_id } = req.body;

        const [tasks] = await query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await run(
            'UPDATE tasks SET title = ?, description = ?, deadline = ?, priority = ?, status = ?, assigned_to = ?, assigned_to_role = ?, team_id = ? WHERE id = ?',
            [title, description, deadline, priority, status, assigned_to, assigned_to_role, team_id, id]
        );

        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const [tasks] = await query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await run('DELETE FROM tasks WHERE id = ?', [id]);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const submitTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const submissionFile = req.file ? req.file.filename : null;

        await run(
            'INSERT INTO task_submissions (task_id, submitted_by, submission_file, notes) VALUES (?, ?, ?, ?)',
            [id, req.user.id, submissionFile, notes]
        );

        await run('UPDATE tasks SET status = ? WHERE id = ?', ['completed', id]);

        res.json({ message: 'Task submitted successfully' });
    } catch (error) {
        console.error('Submit task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    submitTask
};
