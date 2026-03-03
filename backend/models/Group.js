const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "B.Tech CS - Sem 3 Group"
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// A Group is essentially a private isolated space corresponding 1:1 with a Semester.
// All access to live classes, materials, and assessments will be verified against membership in this Group.

module.exports = mongoose.model('Group', groupSchema);
