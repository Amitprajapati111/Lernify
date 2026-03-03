const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getUsers,
    createUser,
    toggleUserStatus,
    bulkUploadStudents,
    assignTeacherToSubject,
    assignStudentToSemester,
    getGlobalCourses,
    getGlobalLiveClasses
} = require('../controllers/adminController');
const {
    getAttendanceAnalytics,
    getAssessmentAnalytics
} = require('../controllers/reportController');

const upload = multer({ dest: 'uploads/' });

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/status', toggleUserStatus);
router.post('/users/bulk-upload-students', upload.single('file'), bulkUploadStudents);
router.post('/assign-teacher', assignTeacherToSubject);
router.post('/assign-student', assignStudentToSemester);
router.get('/courses', getGlobalCourses);
router.get('/live-classes', getGlobalLiveClasses);

// Reporting routes
router.get('/reports/attendance/:semesterId', getAttendanceAnalytics);
router.get('/reports/assessments/:semesterId', getAssessmentAnalytics);

module.exports = router;
