const LiveClass = require('../models/LiveClass');
const Attendance = require('../models/Attendance');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all active live classes
// @route   GET /api/live-classes
// @access  Public
const getActiveClasses = async (req, res) => {
    try {
        const classes = await LiveClass.find({ status: { $in: ['scheduled', 'ongoing'] } })
            .populate('subject', 'name code')
            .populate('teacher', 'name');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active live classes strictly by subject
// @route   GET /api/live-classes/subject/:subjectId
// @access  Private (Protected by checkStudentAccess)
const getActiveClassesBySubject = async (req, res) => {
    try {
        const classes = await LiveClass.find({
            subject: req.params.subjectId,
            status: { $in: ['scheduled', 'ongoing'] }
        })
            .populate('subject', 'name code')
            .populate('teacher', 'name');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new live class session
// @route   POST /api/live-classes
// @access  Private/Teacher
const createLiveClass = async (req, res) => {
    try {
        const { subject, topic, startTime, timetableRef } = req.body;

        const roomId = uuidv4();

        const liveClass = await LiveClass.create({
            subject,
            teacher: req.user.id,
            timetableRef,
            topic,
            startTime: startTime || Date.now(),
            roomId,
            status: 'scheduled'
        });

        res.status(201).json(liveClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Start/Join live class
// @route   PUT /api/live-classes/:id/start
// @access  Private/Teacher
const startLiveClass = async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id);

        if (!liveClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Authorization check
        if (liveClass.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to start this class' });
        }

        liveClass.status = 'ongoing';
        await liveClass.save();

        res.json(liveClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    End live class
// @route   PUT /api/live-classes/:id/end
// @access  Private/Teacher
const endLiveClass = async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id);

        if (!liveClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (liveClass.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to end this class' });
        }

        liveClass.status = 'completed';
        liveClass.endTime = Date.now();
        await liveClass.save();

        // Also trigger attendance finalization here if needed...

        res.json(liveClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live class by roomId
// @route   GET /api/live-classes/room/:roomId
// @access  Private (Teacher, Admin, or enrolled Student)
const getLiveClassByRoomId = async (req, res) => {
    try {
        const liveClass = await LiveClass.findOne({ roomId: req.params.roomId })
            .populate('subject', 'name code')
            .populate('teacher', 'name role');

        if (!liveClass) {
            return res.status(404).json({ message: 'Live class not found' });
        }

        res.json(liveClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getActiveClasses,
    getActiveClassesBySubject,
    createLiveClass,
    startLiveClass,
    endLiveClass,
    getLiveClassByRoomId
};
