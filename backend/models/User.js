const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student'],
        default: 'student',
        required: true
    },
    // fields specific to student
    enrollmentNo: { type: String },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
    // fields common or specific to teacher
    department: { type: String },
    joinedAt: { type: Date, default: Date.now },
    // Admin controls
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
