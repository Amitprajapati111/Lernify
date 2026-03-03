const User = require('../models/User');
const Group = require('../models/Group');
const { Semester, Subject } = require('../models/AcademicStructure');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const csv = require('csv-parser');

// @desc    Get all users, optionally filtered by role
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const query = req.query.role ? { role: req.query.role } : {};
        const users = await User.find(query).select('-password').populate('semester', 'number');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a single user manually
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, enrollmentNo, semesterId, department } = req.body;

        // Check user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'Learnify@123', salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
        };

        if (role === 'student') {
            userData.enrollmentNo = enrollmentNo;
            userData.semester = semesterId;
        } else if (role === 'teacher') {
            userData.department = department;
        }

        const user = await User.create(userData);

        if (role === 'student' && semesterId) {
            const group = await Group.findOne({ semester: semesterId });
            if (group) {
                await Group.findByIdAndUpdate(group._id, {
                    $addToSet: { students: user._id }
                });
            }
        }

        res.status(201).json({ message: 'User created successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle User Status (Block/Unblock)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = user.status === 'active' ? 'blocked' : 'active';
        await user.save();
        res.json({ message: `User status updated to ${user.status}`, user: { _id: user._id, status: user.status } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Upload Students via CSV
// @route   POST /api/admin/users/bulk-upload-students
// @access  Private/Admin
const bulkUploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const results = [];
        const semesterId = req.body.semesterId;

        if (!semesterId) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Semester ID is required' });
        }

        const group = await Group.findOne({ semester: semesterId });
        if (!group) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'No Group found for this Semester. Ensure Semester was created properly.' });
        }

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                const addedStudents = [];
                const errors = [];

                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    try {
                        const exists = await User.findOne({ email: row.email });
                        if (exists) {
                            errors.push(`Row ${i + 1}: Email ${row.email} already exists`);
                            continue;
                        }

                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(row.password || 'Student@123', salt);

                        const user = await User.create({
                            name: row.name,
                            email: row.email,
                            password: hashedPassword,
                            role: 'student',
                            enrollmentNo: row.enrollmentNo,
                            semester: semesterId,
                        });

                        addedStudents.push(user._id);
                    } catch (err) {
                        errors.push(`Row ${i + 1}: Error - ${err.message}`);
                    }
                }

                if (addedStudents.length > 0) {
                    await Group.findByIdAndUpdate(group._id, {
                        $addToSet: { students: { $each: addedStudents } }
                    });
                }

                fs.unlinkSync(req.file.path);

                res.status(200).json({
                    message: `Successfully processed CSV. Added ${addedStudents.length} students.`,
                    added: addedStudents.length,
                    errors
                });
            });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign Teacher to Subject (and automatically to its Group)
// @route   POST /api/admin/assign-teacher
// @access  Private/Admin
const assignTeacherToSubject = async (req, res) => {
    try {
        const { teacherId, subjectId } = req.body;

        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({ message: 'Valid Teacher not found' });
        }

        if (!subject.teachers.includes(teacherId)) {
            subject.teachers.push(teacherId);
            await subject.save();
        }

        const group = await Group.findOne({ semester: subject.semester });
        if (group && !group.teachers.includes(teacherId)) {
            group.teachers.push(teacherId);
            await group.save();
        }

        res.json({ message: 'Teacher successfully assigned to subject and group', subject });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign an existing student to a Semester (Group)
// @route   POST /api/admin/assign-student
// @access  Private/Admin
const assignStudentToSemester = async (req, res) => {
    try {
        const { studentId, semesterId } = req.body;

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Valid Student not found' });
        }

        const group = await Group.findOne({ semester: semesterId });
        if (!group) {
            return res.status(404).json({ message: 'Semester Group not found' });
        }

        // Add to group
        if (!group.students.includes(studentId)) {
            group.students.push(studentId);
            await group.save();
        }

        // Update user
        student.semester = semesterId;
        await student.save();

        res.json({ message: 'Student successfully assigned to Semester Group' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all Courses globally (Admin View)
// @route   GET /api/admin/courses
// @access  Private/Admin
const getGlobalCourses = async (req, res) => {
    try {
        // Fetch courses and deeply populate their structure
        const courses = await require('../models/AcademicStructure').Course.find().lean();

        for (let course of courses) {
            const semesters = await require('../models/AcademicStructure').Semester.find({ course: course._id }).lean();
            for (let sem of semesters) {
                sem.subjects = await require('../models/AcademicStructure').Subject.find({ semester: sem._id })
                    .populate('teachers', 'name')
                    .lean();
            }
            course.semesters = semesters;
        }

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all live classes globally (Admin View)
// @route   GET /api/admin/live-classes
// @access  Private/Admin
const getGlobalLiveClasses = async (req, res) => {
    try {
        const classes = await require('../models/LiveClass').find()
            .populate('subject', 'name code')
            .populate('teacher', 'name email')
            .sort({ startTime: -1 })
            .lean();

        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    createUser,
    toggleUserStatus,
    bulkUploadStudents,
    assignTeacherToSubject,
    assignStudentToSemester,
    getGlobalCourses,
    getGlobalLiveClasses
};
