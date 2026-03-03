const Attendance = require('../models/Attendance');
const LiveClass = require('../models/LiveClass');
const { Parser } = require('json2csv');

// @desc    Mark student attendance
// @route   POST /api/attendance
// @access  Private/Student
const markAttendance = async (req, res) => {
    try {
        const { liveClassId } = req.body; // Actually passes the roomId string from frontend
        const studentId = req.user.id;

        const liveClass = await LiveClass.findOne({ roomId: liveClassId });
        if (!liveClass || liveClass.status !== 'ongoing') {
            return res.status(400).json({ message: 'Live class is not currently active' });
        }

        // Check if attendance already marked
        const existing = await Attendance.findOne({ liveClass: liveClassId, student: studentId });
        if (existing) {
            return res.status(400).json({ message: 'Attendance already marked' });
        }

        const attendance = await Attendance.create({
            liveClass: liveClass._id,
            student: studentId,
            joinTime: Date.now(),
            status: 'present'
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update attendance leave time
// @route   PUT /api/attendance/leave
// @access  Private/Student
const leaveClass = async (req, res) => {
    try {
        const { liveClassId } = req.body; // roomId string
        const studentId = req.user.id;

        const liveClass = await LiveClass.findOne({ roomId: liveClassId });
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        const attendance = await Attendance.findOne({ liveClass: liveClass._id, student: studentId });

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        attendance.leaveTime = Date.now();
        const durationMs = attendance.leaveTime - attendance.joinTime;
        attendance.durationMinutes = Math.floor(durationMs / 1000 / 60);

        // Example logic: if duration is less than 30 mins, mark absent
        // We will disable this strictly for testing purposes to allow shorter sessions to stay 'present'
        // if (attendance.durationMinutes < 30) {
        //     attendance.status = 'absent';
        // }

        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a specific class (Teacher)
// @route   GET /api/attendance/class/:liveClassId
// @access  Private/Teacher
const getClassAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ liveClass: req.params.liveClassId })
            .populate('student', 'name email enrollmentNo');

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manual override by teacher
// @route   PUT /api/attendance/:id/override
// @access  Private/Teacher
const overrideAttendance = async (req, res) => {
    try {
        const { status } = req.body;
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Record not found' });
        }

        attendance.status = status;
        attendance.isManualOverride = true;
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export attendance as CSV (Teacher)
// @route   GET /api/attendance/class/:liveClassId/export
// @access  Private/Teacher
const exportClassAttendanceCSV = async (req, res) => {
    try {
        const attendance = await Attendance.find({ liveClass: req.params.liveClassId })
            .populate('student', 'name enrollmentNo email');

        const csvFields = ['Name', 'EnrollmentNo', 'Email', 'JoinTime', 'LeaveTime', 'DurationMinutes', 'Status', 'ManualOverride'];

        const csvData = (attendance && attendance.length > 0) ? attendance.map(record => ({
            Name: record.student?.name || 'Unknown',
            EnrollmentNo: record.student?.enrollmentNo || 'Unknown',
            Email: record.student?.email || 'Unknown',
            JoinTime: record.joinTime ? new Date(record.joinTime).toLocaleString() : 'N/A',
            LeaveTime: record.leaveTime ? new Date(record.leaveTime).toLocaleString() : 'N/A',
            DurationMinutes: record.durationMinutes || 0,
            Status: record.status,
            ManualOverride: record.isManualOverride ? 'Yes' : 'No'
        })) : [];

        const json2csvParser = new Parser({ fields: csvFields });
        const csv = json2csvParser.parse(csvData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-${req.params.liveClassId}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Log attendance for currently connected students (Teacher)
// @route   POST /api/attendance/class/:roomId/manual
// @access  Private/Teacher
const manualLogAttendance = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { studentIds } = req.body;

        const liveClass = await LiveClass.findOne({ roomId });
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        if (liveClass.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to log attendance' });
        }

        const newRecords = [];

        for (const studentId of studentIds) {
            const existing = await Attendance.findOne({ liveClass: liveClass._id, student: studentId });
            if (!existing) {
                newRecords.push({
                    liveClass: liveClass._id,
                    student: studentId,
                    joinTime: Date.now(),
                    status: 'present',
                    isManualOverride: true
                });
            }
        }

        if (newRecords.length > 0) {
            await Attendance.insertMany(newRecords);
        }

        res.json({ message: 'Attendance manually logged successfully', added: newRecords.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    leaveClass,
    getClassAttendance,
    overrideAttendance,
    exportClassAttendanceCSV,
    manualLogAttendance
};
