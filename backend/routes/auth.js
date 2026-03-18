// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, businessName });

    await newUser.save();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Login Route

router.post('/login', async(req, res) => {
  try{
    const { email, password } = req.body;

    //check if user exists
    const user = await User.findOne({ email });
    if(!User) return res.status(400).json({ message: "Invalid email or password"});
  
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ message: "Invalid email or password"});
  
    const token = jwt.sign(
      {
        id: user._id, role: user.role
      },
      process.env.JWT_SECRET,
      {expiresIn: '7d' }
    );

    //send back token + role
    res.status(200).json({
      message: "Login succesfull",
      token,
      role: user.role,
      name: user.name
    });
  
  }
  catch(error){
    res.status(500).json({error: error.message});
  }
})

module.exports = router;