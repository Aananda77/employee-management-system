const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function initDatabase() {
    try {
        console.log('🚀 Initializing database...\n');

        // Create tables
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'employee')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS teams (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    team_name TEXT NOT NULL,
                    team_code TEXT NOT NULL UNIQUE,
                    team_description TEXT,
                    created_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS managers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL UNIQUE,
                    full_name TEXT,
                    phone_number TEXT,
                    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
                    address TEXT,
                    profile_photo TEXT,
                    about TEXT,
                    team_id INTEGER,
                    profile_complete BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS employees (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL UNIQUE,
                    full_name TEXT,
                    phone_number TEXT,
                    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
                    address TEXT,
                    profile_photo TEXT,
                    about TEXT,
                    team_id INTEGER,
                    manager_id INTEGER,
                    profile_complete BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
                    FOREIGN KEY (manager_id) REFERENCES managers(id) ON DELETE SET NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    deadline DATE,
                    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
                    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
                    assigned_by INTEGER,
                    assigned_to INTEGER,
                    assigned_to_role TEXT CHECK(assigned_to_role IN ('manager', 'employee')),
                    team_id INTEGER,
                    attachment TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
                    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
                    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS task_submissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id INTEGER NOT NULL,
                    submitted_by INTEGER NOT NULL,
                    submission_file TEXT,
                    notes TEXT,
                    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    date DATE NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late')),
                    marked_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, date),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS leave_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    reason TEXT NOT NULL,
                    leave_type TEXT NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
                    reviewed_by INTEGER,
                    reviewed_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS announcements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_by INTEGER,
                    visibility TEXT DEFAULT 'all' CHECK(visibility IN ('all', 'team', 'managers', 'employees')),
                    team_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });

        console.log('✅ Tables created successfully!\n');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insert Admin
        const adminId = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                ['admin', 'admin@company.com', hashedPassword, 'admin'],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
        console.log('✅ Admin inserted');

        // Insert a default team first
        const teamId = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO teams (team_name, team_code, team_description, created_by) VALUES (?, ?, ?, ?)',
                ['Development Team', 'DEV-001', 'Software development team', adminId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
        console.log('✅ Team inserted');

        // Insert Manager
        const managerUserId = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                ['manager', 'manager@company.com', hashedPassword, 'manager'],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO managers (user_id, profile_complete, team_id) VALUES (?, 1, ?)', [managerUserId, teamId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('✅ Manager inserted');

        // Insert Employee
        const employeeUserId = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                ['employee', 'employee@company.com', hashedPassword, 'employee'],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO employees (user_id, profile_complete, team_id) VALUES (?, 1, ?)', [employeeUserId, teamId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('✅ Employee inserted\n');

        console.log('🎉 Database initialized successfully!\n');
        console.log('📋 Login Credentials:');
        console.log('   Admin:');
        console.log('     Username: admin');
        console.log('     Password: password123');
        console.log('   Manager:');
        console.log('     Username: manager');
        console.log('     Password: password123');
        console.log('   Employee:');
        console.log('     Username: employee');
        console.log('     Password: password123\n');

        db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        db.close();
        process.exit(1);
    }
}

initDatabase();
