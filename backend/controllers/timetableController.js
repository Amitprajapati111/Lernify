const Timetable = require('../models/Timetable');

// @desc    Get timetable for a semester
// @route   GET /api/timetable/semester/:semesterId
// @access  Public
const getSemesterTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.find({ semester: req.params.semesterId })
            .populate('subject', 'name code')
            .populate('teacher', 'name email');
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
const createTimetableEntry = async (req, res) => {
    try {
        const { subject, teacher, semester, dayOfWeek, startTime, endTime, room } = req.body;

        // Check for collision (teacher double booked or room double booked)
        // Simplified version: just create it for now
        const entry = await Timetable.create({
            subject,
            teacher,
            semester,
            dayOfWeek,
            startTime,
            endTime,
            room
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teacher's timetable
// @route   GET /api/timetable/teacher/:teacherId
// @access  Private
const getTeacherTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.find({ teacher: req.params.teacherId })
            .populate('subject', 'name code')
            .populate('semester', 'number');
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSemesterTimetable,
    createTimetableEntry,
    getTeacherTimetable
};
