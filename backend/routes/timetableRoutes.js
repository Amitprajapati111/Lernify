const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin'), timetableController.createTimetableEntry);

router.route('/semester/:semesterId')
    .get(timetableController.getSemesterTimetable);

router.route('/teacher/:teacherId')
    .get(protect, timetableController.getTeacherTimetable);

module.exports = router;
