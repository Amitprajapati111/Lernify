const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student'), attendanceController.markAttendance);
router.put('/leave', protect, authorize('student'), attendanceController.leaveClass);

router.get('/class/:liveClassId', protect, authorize('teacher', 'admin'), attendanceController.getClassAttendance);
router.get('/class/:liveClassId/export', protect, authorize('teacher', 'admin'), attendanceController.exportClassAttendanceCSV);
router.put('/:id/override', protect, authorize('teacher', 'admin'), attendanceController.overrideAttendance);
router.post('/class/:roomId/manual', protect, authorize('teacher', 'admin'), attendanceController.manualLogAttendance);

module.exports = router;
