const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const VolunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },  
    password: {
        type: String,
        required: true
    }
});

VolunteerSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (err) {
        next(err);
    }
});

const Volunteer = mongoose.model('Volunteer', VolunteerSchema);
module.exports = Volunteer;
