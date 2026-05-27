const bcrypt = require('bcryptjs');
const { query, run } = require('../config/database');

const getAllUsers = async (req, res) => {
    try {
        const { role, team_id } = req.query;
        let sql = `
            SELECT u.id, u.username, u.email, u.role, u.created_at,
                   CASE
                       WHEN u.role = 'manager' THEN m.full_name
                       WHEN u.role = 'employee' THEN e.full_name
                       ELSE NULL
                   END as full_name,
                   CASE
                       WHEN u.role = 'manager' THEN m.team_id
                       WHEN u.role = 'employee' THEN e.team_id
                       ELSE NULL
                   END as team_id
            FROM users u
            LEFT JOIN managers m ON u.id = m.user_id
            LEFT JOIN employees e ON u.id = e.user_id
            WHERE 1=1
        `;
        const params = [];

        if (role) {
            sql += ' AND u.role = ?';
            params.push(role);
        }

        if (team_id) {
            sql += ' AND (m.team_id = ? OR e.team_id = ?)';
            params.push(team_id, team_id);
        }

        const [users] = await query(sql, params);
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, role, team_id } = req.body;

        const [existingUsers] = await query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await run(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        if (role === 'manager') {
            await run(
                'INSERT INTO managers (user_id, team_id) VALUES (?, ?)',
                [result.insertId, team_id || null]
            );
        } else if (role === 'employee') {
            await run(
                'INSERT INTO employees (user_id, team_id) VALUES (?, ?)',
                [result.insertId, team_id || null]
            );
        }

        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, team_id, full_name, phone_number, gender, address, about } = req.body;

        const [users] = await query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        await run(
            'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
            [username, email, role, id]
        );

        if (role === 'manager') {
            const [managers] = await query('SELECT * FROM managers WHERE user_id = ?', [id]);
            if (managers.length > 0) {
                await run(
                    'UPDATE managers SET team_id = ?, full_name = ?, phone_number = ?, gender = ?, address = ?, about = ? WHERE user_id = ?',
                    [team_id, full_name, phone_number, gender, address, about, id]
                );
            }
        } else if (role === 'employee') {
            const [employees] = await query('SELECT * FROM employees WHERE user_id = ?', [id]);
            if (employees.length > 0) {
                await run(
                    'UPDATE employees SET team_id = ?, full_name = ?, phone_number = ?, gender = ?, address = ?, about = ? WHERE user_id = ?',
                    [team_id, full_name, phone_number, gender, address, about, id]
                );
            }
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        await run('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { full_name, phone_number, gender, address, about, team_id, manager_id } = req.body;
        const profilePhoto = req.file ? req.file.filename : null;

        if (req.user.role === 'manager') {
            const [managers] = await query('SELECT * FROM managers WHERE user_id = ?', [req.user.id]);
            if (managers.length > 0) {
                let sql = 'UPDATE managers SET full_name = ?, phone_number = ?, gender = ?, address = ?, about = ?, team_id = ?, profile_complete = 1';
                const params = [full_name, phone_number, gender, address, about, team_id];

                if (profilePhoto) {
                    sql += ', profile_photo = ?';
                    params.push(profilePhoto);
                }

                sql += ' WHERE user_id = ?';
                params.push(req.user.id);

                await run(sql, params);
            }
        } else if (req.user.role === 'employee') {
            const [employees] = await query('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
            if (employees.length > 0) {
                let sql = 'UPDATE employees SET full_name = ?, phone_number = ?, gender = ?, address = ?, about = ?, team_id = ?, manager_id = ?, profile_complete = 1';
                const params = [full_name, phone_number, gender, address, about, team_id, manager_id];

                if (profilePhoto) {
                    sql += ', profile_photo = ?';
                    params.push(profilePhoto);
                }

                sql += ' WHERE user_id = ?';
                params.push(req.user.id);

                await run(sql, params);
            }
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    updateProfile
};
