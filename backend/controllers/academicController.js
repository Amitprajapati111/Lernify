const { Course, Semester, Subject } = require('../models/AcademicStructure');
const Group = require('../models/Group');

// @desc    Get all courses
// @route   GET /api/academic/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/academic/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    try {
        const { name, description, durationYears } = req.body;
        const course = await Course.create({ name, description, durationYears });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get semesters for a course
// @route   GET /api/academic/courses/:courseId/semesters
// @access  Public
const getSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find({ course: req.params.courseId });
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a semester
// @route   POST /api/academic/courses/:courseId/semesters
// @access  Private/Admin
const createSemester = async (req, res) => {
    try {
        const { number, startDate, endDate } = req.body;
        const semester = await Semester.create({
            course: req.params.courseId,
            number,
            startDate,
            endDate
        });

        // Auto-create private access Group for this Semester
        const course = await Course.findById(req.params.courseId);
        const groupName = `${course.name} - Semester ${number}`;
        await Group.create({
            name: groupName,
            semester: semester._id,
            course: req.params.courseId
        });

        res.status(201).json(semester);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get subjects for a semester
// @route   GET /api/academic/semesters/:semesterId/subjects
// @access  Public
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ semester: req.params.semesterId }).populate('teachers', 'name email');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a subject
// @route   POST /api/academic/semesters/:semesterId/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    try {
        const { name, code, credits, teachers } = req.body;
        const subject = await Subject.create({
            semester: req.params.semesterId,
            name,
            code,
            credits,
            teachers
        });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get subjects explicitly assigned to a teacher
// @route   GET /api/academic/teacher/subjects
// @access  Private/Teacher
const getTeacherSubjects = async (req, res) => {
    try {
        const teacherId = req.user.id;
        // Find all subjects where the teachers array contains this teacherId
        const subjects = await Subject.find({ teachers: teacherId })
            .populate('semester', 'number startDate endDate course')
            .populate({
                path: 'semester',
                populate: {
                    path: 'course',
                    select: 'name'
                }
            });

        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    createCourse,
    getSemesters,
    createSemester,
    getSubjects,
    getTeacherSubjects,
    createSubject
};
