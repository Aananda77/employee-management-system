const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function seedDummyUsers() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log('Inserting dummy users...');

        // Insert Admin
        const [adminResult] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@company.com', hashedPassword, 'admin']
        );
        console.log('✅ Admin inserted with ID:', adminResult.insertId);

        // Insert Manager
        const [managerResult] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['manager', 'manager@company.com', hashedPassword, 'manager']
        );
        const managerUserId = managerResult.insertId;
        await pool.query('INSERT INTO managers (user_id) VALUES (?)', [managerUserId]);
        console.log('✅ Manager inserted with ID:', managerResult.insertId);

        // Insert Employee
        const [employeeResult] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['employee', 'employee@company.com', hashedPassword, 'employee']
        );
        const employeeUserId = employeeResult.insertId;
        await pool.query('INSERT INTO employees (user_id) VALUES (?)', [employeeUserId]);
        console.log('✅ Employee inserted with ID:', employeeResult.insertId);

        // Insert a default team
        const [teamResult] = await pool.query(
            'INSERT INTO teams (team_name, team_code, team_description, created_by) VALUES (?, ?, ?, ?)',
            ['Development Team', 'DEV-001', 'Software development team', adminResult.insertId]
        );
        console.log('✅ Team inserted with ID:', teamResult.insertId);

        console.log('\n🎉 Dummy data inserted successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin:');
        console.log('     Username: admin');
        console.log('     Password: password123');
        console.log('   Manager:');
        console.log('     Username: manager');
        console.log('     Password: password123');
        console.log('   Employee:');
        console.log('     Username: employee');
        console.log('     Password: password123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error inserting dummy data:', error);
        process.exit(1);
    }
}

seedDummyUsers();
