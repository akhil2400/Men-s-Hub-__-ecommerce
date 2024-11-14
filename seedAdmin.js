// seedAdmin.js
const bcrypt = require('bcrypt');
const Admin = require('./models/adminModel');  // Adjust the path to your Admin model
const connectDB = require('./db/connectdb');  // Adjust the path to your connectDB file
const mongoose = require('mongoose');

// Connect to MongoDB
connectDB();

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash('adminAkhil@2400', 10);  // Replace with a secure password
            const adminUser = new Admin({
                username: 'adminAkhil',
                password: hashedPassword,
                role: 'admin'  // Admin role explicitly set here
            });

            // Save admin user to the database
            await adminUser.save();
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close();  // Close the connection after execution
    }
}

// Create the admin user
createAdmin();
