const express = require('express');
const router = express.Router();
const liveClassController = require('../controllers/liveClassController');
const { protect, authorize, checkStudentAccess } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('teacher', 'admin'), liveClassController.createLiveClass);

// Use subject-specific route to enforce student group mappings
router.route('/subject/:subjectId')
    .get(protect, checkStudentAccess, liveClassController.getActiveClassesBySubject);

router.route('/room/:roomId')
    .get(protect, liveClassController.getLiveClassByRoomId);

router.route('/:id/start')
    .put(protect, authorize('teacher', 'admin'), liveClassController.startLiveClass);

router.route('/:id/end')
    .put(protect, authorize('teacher', 'admin'), liveClassController.endLiveClass);

module.exports = router;
