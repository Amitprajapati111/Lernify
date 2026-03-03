const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    liveClass: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinTime: { type: Date },
    leaveTime: { type: Date },
    durationMinutes: { type: Number, default: 0 },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'absent' },
    isManualOverride: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure unique attendance record per student per live class
attendanceSchema.index({ liveClass: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
