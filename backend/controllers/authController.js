const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run } = require('../config/database');

const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

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
            await run('INSERT INTO managers (user_id) VALUES (?)', [result.insertId]);
        } else if (role === 'employee') {
            await run('INSERT INTO employees (user_id) VALUES (?)', [result.insertId]);
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        let profileData = null;
        let profileComplete = true;

        if (user.role === 'manager') {
            const [managers] = await query('SELECT * FROM managers WHERE user_id = ?', [user.id]);
            if (managers.length > 0) {
                profileData = { ...managers[0], profile_complete: !!managers[0].profile_complete };
                profileComplete = !!managers[0].profile_complete;
            }
        } else if (user.role === 'employee') {
            const [employees] = await query('SELECT * FROM employees WHERE user_id = ?', [user.id]);
            if (employees.length > 0) {
                profileData = { ...employees[0], profile_complete: !!employees[0].profile_complete };
                profileComplete = !!employees[0].profile_complete;
            }
        }

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            profile: profileData,
            profileComplete
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const [users] = await query(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profileData = null;
        if (req.user.role === 'manager') {
            const [managers] = await query('SELECT * FROM managers WHERE user_id = ?', [req.user.id]);
            profileData = managers[0] ? { ...managers[0], profile_complete: !!managers[0].profile_complete } : null;
        } else if (req.user.role === 'employee') {
            const [employees] = await query('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
            profileData = employees[0] ? { ...employees[0], profile_complete: !!employees[0].profile_complete } : null;
        }

        res.json({
            user: users[0],
            profile: profileData
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { register, login, getMe };
