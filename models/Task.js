const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }],
    completedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }],
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
