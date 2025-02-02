const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Task = require('./models/Task');
const Volunteer = require('./models/Volunteer');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express Session
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Database connection
mongoose.connect('mongodb://localhost:27017/shelter_seek', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

// Routes
app.use('/', require('./routes/index'));
app.use('/volunteer', require('./routes/volunteer'));
app.use('/auth', require('./routes/auth'));


// Route for submitting tasks
app.post('/submit-task', async (req, res) => {
    const { name, address } = req.body;

    try {
        // Create a new task
        const newTask = new Task({ name, address });

        // Find all volunteers
        const volunteers = await Volunteer.find();

        // Assign the new task to each volunteer
        volunteers.forEach(async (volunteer) => {
            newTask.assignedTo.push(volunteer._id);
        });

        // Save the task
        await newTask.save();

        res.status(200).json({ message: 'Task submitted successfully!' });
    } catch (error) {
        console.error('Error submitting task:', error);
        res.status(500).json({ error: 'Error submitting task' });
    }
});

// Route for volunteer registration
app.post('/volunteer', async (req, res) => {
    const { firstName, lastName, username, password } = req.body;

    if (!firstName || !lastName || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingVolunteer = await Volunteer.findOne({ username });
        if (existingVolunteer) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newVolunteer = new Volunteer({
            name: `${firstName} ${lastName}`,
            username,
            password
        });

        await newVolunteer.save();
        res.status(200).json({ message: 'Volunteer registered successfully!' });
    } catch (error) {
        console.error('Error registering volunteer:', error);
        res.status(500).json({ error: 'Error registering volunteer' });
    }
});

// Route for handling login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingVolunteer = await Volunteer.findOne({ username });
        if (!existingVolunteer) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const isPasswordMatch = await bcrypt.compare(password, existingVolunteer.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        req.session.volunteerId = existingVolunteer._id;
        res.redirect('/volunteers');
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Route for the volunteer's page
app.get('/volunteers', async (req, res) => {
    try {
        const volunteerId = req.session.volunteerId;
        if (!volunteerId) {
            return res.redirect('/auth/login');
        }

        // Fetch pending tasks excluding those completed by the current volunteer
        const tasksPending = await Task.find({ 
            assignedTo: volunteerId, 
            status: 'pending', 
            completedBy: { $ne: volunteerId } 
        });

        // Fetch tasks completed by the current volunteer only
        const tasksCompleted = await Task.find({ 
            completedBy: volunteerId,
            assignedTo: volunteerId // Only fetch tasks completed by the current volunteer
        });

        res.render('volunteers', { tasksPending, tasksCompleted });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
