const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Sun, 1=Mon, etc.
    startTime: { type: String, required: true }, // e.g., "09:00"
    endTime: { type: String, required: true },   // e.g., "10:30"
    room: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
