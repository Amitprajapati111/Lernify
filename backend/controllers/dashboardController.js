const User = require('../models/User');
const { Course, Subject } = require('../models/AcademicStructure');
const LiveClass = require('../models/LiveClass');
const Attendance = require('../models/Attendance');
const { Assessment, Submission } = require('../models/Assessment');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalCourses = await Course.countDocuments();
        const activeClasses = await LiveClass.countDocuments({ status: 'ongoing' });

        res.json({
            totalStudents,
            totalTeachers,
            totalCourses,
            activeClasses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teacher dashboard stats
// @route   GET /api/dashboard/teacher
// @access  Private/Teacher
const getTeacherStats = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // Subjects taught by teacher
        const subjectsCount = await Subject.countDocuments({ teachers: teacherId });

        // Total classes conducted
        const classesConducted = await LiveClass.countDocuments({ teacher: teacherId, status: 'completed' });

        // Total assignments created
        const assignmentsCreated = await Assessment.countDocuments({ teacher: teacherId });

        res.json({
            subjectsCount,
            classesConducted,
            assignmentsCreated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student dashboard stats
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentStats = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Classes attended
        const attendanceRecords = await Attendance.find({ student: studentId, status: { $in: ['present', 'late'] } });
        const classesAttended = attendanceRecords.length;

        // Assignments submitted
        const submissions = await Submission.countDocuments({ student: studentId });

        // Enrolled subjects via semester
        const user = await User.findById(studentId);
        let subjectsCount = 0;
        if (user.semester) {
            subjectsCount = await Subject.countDocuments({ semester: user.semester });
        }

        res.json({
            classesAttended,
            assignmentsSubmitted: submissions,
            enrolledSubjects: subjectsCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminStats,
    getTeacherStats,
    getStudentStats
};
