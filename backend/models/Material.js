const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['document', 'recording', 'link', 'other'], required: true },
    fileUrl: { type: String, required: false },
    folderName: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
