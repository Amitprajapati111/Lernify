const { Semester, Subject } = require('../models/AcademicStructure');
const Group = require('../models/Group');
const mongoose = require('mongoose');

// @desc    Get Attendance Analytics per Semester
// @route   GET /api/admin/reports/attendance/:semesterId
// @access  Private/Admin
const getAttendanceAnalytics = async (req, res) => {
    try {
        const { semesterId } = req.params;

        // Ensure valid Semester exists
        const semester = await Semester.findById(semesterId);
        if (!semester) return res.status(404).json({ message: 'Semester not found' });

        // Build aggregation pipeline to get attendance stats
        // We look up 'Attendance' joined with 'LiveClass' filtered by this Semester's Subjects

        // Find all subjects in this semester
        const subjects = await Subject.find({ semester: semesterId });
        const subjectIds = subjects.map(s => s._id);

        const attendanceStats = await mongoose.model('Attendance').aggregate([
            {
                $lookup: {
                    from: 'liveclasses',
                    localField: 'liveClass',
                    foreignField: '_id',
                    as: 'classDetails'
                }
            },
            { $unwind: '$classDetails' },
            {
                $match: {
                    'classDetails.subject': { $in: subjectIds }
                }
            },
            {
                $group: {
                    _id: '$status', // group by 'present', 'absent', 'late'
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            present: 0,
            absent: 0,
            late: 0,
            totalRecords: 0
        };

        attendanceStats.forEach(stat => {
            if (stat._id) formattedStats[stat._id] = stat.count;
            formattedStats.totalRecords += stat.count;
        });

        res.json({ semester: semester.number, stats: formattedStats });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Assignment & Exam Summary per Semester
// @route   GET /api/admin/reports/assessments/:semesterId
// @access  Private/Admin
const getAssessmentAnalytics = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const subjects = await Subject.find({ semester: semesterId });
        const subjectIds = subjects.map(s => s._id);

        // Fetch all assessments for these subjects
        const assessments = await mongoose.model('Assessment').find({ subject: { $in: subjectIds } });
        const assessmentIds = assessments.map(a => a._id);

        // Aggregation to count submissions per status ('submitted', 'graded', 'late')
        const submissionStats = await mongoose.model('Submission').aggregate([
            {
                $match: { assessment: { $in: assessmentIds } }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            submitted: 0,
            graded: 0,
            late: 0,
            totalSubmissions: 0,
            totalAssessmentsPublished: assessments.length
        };

        submissionStats.forEach(stat => {
            if (stat._id) formattedStats[stat._id] = stat.count;
            formattedStats.totalSubmissions += stat.count;
        });

        res.json({ semesterId, stats: formattedStats });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAttendanceAnalytics,
    getAssessmentAnalytics
};
