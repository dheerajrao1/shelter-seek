const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/volunteer', (req, res) => {
    res.render('volunteer');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/volunteers', (req, res) => {
    res.render('volunteers');
});

router.get('/donate', (req, res) => {
    res.render('donate');
});

module.exports = router;
