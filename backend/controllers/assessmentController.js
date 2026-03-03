const { Assessment, Submission } = require('../models/Assessment');

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private/Teacher
const createAssessment = async (req, res) => {
    try {
        const { title, description, subject, type, maxMarks, dueDate } = req.body;
        let fileUrl = null;

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        const assessment = await Assessment.create({
            title,
            description,
            subject,
            teacher: req.user.id,
            type,
            maxMarks,
            dueDate,
            fileUrl
        });

        res.status(201).json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assessments by subject
// @route   GET /api/assessments/subject/:subjectId
// @access  Public
const getAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find({ subject: req.params.subjectId })
            .populate('teacher', 'name');
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit assignment
// @route   POST /api/assessments/:assessmentId/submit
// @access  Private/Student
const submitAssessment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { assessmentId } = req.params;
        const fileUrl = `/uploads/${req.file.filename}`;

        // Check if assessment exists
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // Check if late
        const isLate = new Date() > new Date(assessment.dueDate);
        const status = isLate ? 'late' : 'submitted';

        // Prevent duplicate submission logic from schema
        const submission = await Submission.create({
            assessment: assessmentId,
            student: req.user.id,
            fileUrl,
            status
        });

        res.status(201).json(submission);
    } catch (error) {
        // Check for duplicate key error from Mongo
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted this assessment' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grade submission
// @route   PUT /api/assessments/submissions/:submissionId/grade
// @access  Private/Teacher
const gradeSubmission = async (req, res) => {
    try {
        const { marksObtained, feedback } = req.body;

        const submission = await Submission.findById(req.params.submissionId)
            .populate('assessment');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Teacher authorization check
        if (submission.assessment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to grade this' });
        }

        submission.marksObtained = marksObtained;
        submission.feedback = feedback;
        submission.status = 'graded';

        await submission.save();

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for assessment
// @route   GET /api/assessments/:assessmentId/submissions
// @access  Private/Teacher
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assessment: req.params.assessmentId })
            .populate('student', 'name email enrollmentNo');

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssessment,
    getAssessments,
    submitAssessment,
    gradeSubmission,
    getSubmissions
};
