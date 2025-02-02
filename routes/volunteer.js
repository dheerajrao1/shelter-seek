const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');

// Registration page
router.get('/register', (req, res) => {
    res.render('volunteer');
});

// Register a new volunteer
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const volunteer = new Volunteer({ name, email, password });
        await volunteer.save();
        res.redirect('/login');
    } catch (err) {
        res.status(400).send('Error registering volunteer');
    }
});

// Tasks page for volunteers
router.get('/tasks', async (req, res) => {
    if (!req.session.volunteer) {
        return res.redirect('/auth/login');
    }

    try {
        const volunteerId = req.session.volunteer._id;
        console.log('Volunteer ID:', volunteerId); // Check volunteer ID
        const tasksPending = await Task.find({ assignedTo: volunteerId, status: 'pending' });
        console.log('Pending Tasks:', tasksPending); // Check fetched tasks
        const tasksCompleted = await Task.find({ assignedTo: volunteerId, status: 'completed' }).populate('completedBy');
        console.log('Completed Tasks:', tasksCompleted); // Check fetched tasks

        res.render('volunteers', { tasksPending, tasksCompleted, volunteerId });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Error fetching tasks');
    }
});

router.post('/tasks/complete', async (req, res) => {
    try {
        const { taskId, volunteerId } = req.body;
        const task = await Task.findById(taskId);
        
        // Update the task status to "completed"
        task.status = 'completed';
        task.completedBy = volunteerId; // Set the completedBy field to the Volunteer ID
        await task.save();

        // Remove the completed task from "Pending Tasks" of other volunteers
        await Task.updateMany(
            { _id: { $ne: taskId }, assignedTo: task.assignedTo },
            { $pull: { assignedTo: task.assignedTo } }
        );

        // Populate the volunteer information for the completed task
        await task.populate('completedBy').execPopulate();

        res.json({ message: 'Task marked as completed', task, volunteerInfo: task.completedBy });
    } catch (err) {
        res.status(400).send('Error completing task');
    }
});

// Mark task as unable to complete
router.post('/tasks/unable', async (req, res) => {
    try {
        const { taskId } = req.body;
        const task = await Task.findById(taskId);
        task.assignedTo = task.assignedTo.filter(volunteerId => volunteerId.toString() !== req.session.volunteer._id.toString());
        await task.save();
        res.json({ message: 'Task unassigned successfully' });
    } catch (err) {
        res.status(400).send('Error unassigning task');
    }
});

module.exports = router;
