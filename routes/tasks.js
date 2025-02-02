const express = require('express');
const Task = require('../models/Task');
const Volunteer = require('/path/to/models/Volunteer');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks', error: err });
    }
});

router.post('/assign', async (req, res) => {
    const { taskId, volunteerId } = req.body;
    try {
        const task = await Task.findById(taskId);
        const volunteer = await Volunteer.findById(volunteerId);
        if (!task || !volunteer) {
            return res.status(404).json({ message: 'Task or Volunteer not found' });
        }
        task.assignedTo = volunteer._id;
        await task.save();
        res.status(200).json({ message: 'Task assigned successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error assigning task', error: err });
    }
});

router.post('/complete', async (req, res) => {
    const { taskId, volunteerId } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.assignedTo.toString() !== volunteerId) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }
        task.completed = true;
        await task.save();
        res.status(200).json({ message: 'Task marked as completed' });
    } catch (err) {
        res.status(500).json({ message: '', error: err });
    }
});

router.post('/unable', async (req, res) => {
    const { taskId, volunteerId } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.assignedTo.toString() !== volunteerId) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }
        task.assignedTo = null;
        await task.save();
        res.status(200).json({ message: 'Task unassigned successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error unassigning task', error: err });
    }
});

module.exports = router;
