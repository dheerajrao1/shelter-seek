const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const bcrypt = require('bcrypt');

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const volunteer = await Volunteer.findOne({ username });
        if (!volunteer) {
            return res.status(400).send('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, volunteer.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }
        req.session.volunteer = volunteer;
        res.redirect('/volunteer/tasks');
    } catch (err) {
        res.status(400).send('Error logging in');
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
