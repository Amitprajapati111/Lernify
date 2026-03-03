const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['assignment', 'exam', 'quiz'], required: true },
    maxMarks: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    fileUrl: { type: String } // optional link to uploaded question paper or assignment brief
}, { timestamps: true });

const submissionSchema = new mongoose.Schema({
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissionDate: { type: Date, default: Date.now },
    fileUrl: { type: String, required: true },
    marksObtained: { type: Number },
    feedback: { type: String },
    status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' }
}, { timestamps: true });

// Prevent multiple submissions for the same assessment by the same student
submissionSchema.index({ assessment: 1, student: 1 }, { unique: true });

module.exports = {
    Assessment: mongoose.model('Assessment', assessmentSchema),
    Submission: mongoose.model('Submission', submissionSchema)
};
