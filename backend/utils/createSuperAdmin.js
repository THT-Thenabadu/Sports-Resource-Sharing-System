const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (existing) {
      console.log('✅ Super admin already exists — skipping');
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);
    await User.create({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Super admin created!');
    console.log(`📧 Email: ${process.env.SUPER_ADMIN_EMAIL}`);
  } catch (err) {
    console.error('❌ Failed to create super admin:', err.message);
  }
};

module.exports = createSuperAdmin;
