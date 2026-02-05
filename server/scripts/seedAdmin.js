const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@example.com';
        const adminPass = 'admin123';

        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists');
            // Ensure role is admin
            if (userExists.role !== 'admin') {
                userExists.role = 'admin';
                await userExists.save();
                console.log('Updated existing user to admin role');
            }
        } else {
            const user = await User.create({
                username: 'Admin User',
                email: adminEmail,
                password: adminPass,
                role: 'admin'
            });
            console.log(`Admin user created: ${user.email} / ${adminPass}`);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
