const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/courses')
    .get(academicController.getCourses)
    .post(protect, authorize('admin'), academicController.createCourse);

router.route('/courses/:courseId/semesters')
    .get(academicController.getSemesters)
    .post(protect, authorize('admin'), academicController.createSemester);

router.route('/semesters/:semesterId/subjects')
    .get(academicController.getSubjects)
    .post(protect, authorize('admin'), academicController.createSubject);

// Teacher specific routes
router.route('/teacher/subjects')
    .get(protect, authorize('teacher'), academicController.getTeacherSubjects);

module.exports = router;
