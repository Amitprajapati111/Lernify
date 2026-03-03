const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timetableRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable' },
    topic: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    meetingLink: { type: String }, // optional WebRTC fallback link
    roomId: { type: String, required: true, unique: true }, // generated uuid
    status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
    recordingUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
