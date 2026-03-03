const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin'), dashboardController.getAdminStats);
router.get('/teacher', protect, authorize('teacher'), dashboardController.getTeacherStats);
router.get('/student', protect, authorize('student'), dashboardController.getStudentStats);

module.exports = router;
