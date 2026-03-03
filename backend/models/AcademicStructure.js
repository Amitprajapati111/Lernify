const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    durationYears: { type: Number, required: true }
}, { timestamps: true });

const semesterSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    number: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, default: 3 },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = {
    Course: mongoose.model('Course', courseSchema),
    Semester: mongoose.model('Semester', semesterSchema),
    Subject: mongoose.model('Subject', subjectSchema)
};
