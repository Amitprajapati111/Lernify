const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const { Subject } = require('../models/AcademicStructure');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Protects routes that strictly require a student to be in the Subject's Semester Group
const checkStudentAccess = async (req, res, next) => {
    try {
        if (req.user.role === 'admin' || req.user.role === 'teacher') {
            return next(); // Admins and Teachers bypass this specific student check
        }

        const subjectId = req.params.subjectId;
        if (!subjectId) {
            return res.status(400).json({ message: 'Subject ID is required for access check' });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Find the group associated with this subject's semester
        const group = await Group.findOne({ semester: subject.semester });
        if (!group) {
            return res.status(403).json({ message: 'No access group defined for this academic structure' });
        }

        // Check if student is in the group (convert ObjectId to string for safe comparison)
        if (!group.students.some(id => id.toString() === req.user.id)) {
            return res.status(403).json({ message: 'You are not enrolled in the semester for this subject.' });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during access check' });
    }
};

module.exports = { protect, authorize, checkStudentAccess };
