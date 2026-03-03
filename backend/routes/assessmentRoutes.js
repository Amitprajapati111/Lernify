const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { protect, authorize, checkStudentAccess } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, authorize('teacher', 'admin'), upload.single('file'), assessmentController.createAssessment);

router.route('/subject/:subjectId')
    .get(protect, checkStudentAccess, assessmentController.getAssessments);

router.route('/:assessmentId/submit')
    .post(protect, authorize('student'), upload.single('file'), assessmentController.submitAssessment);

router.route('/:assessmentId/submissions')
    .get(protect, authorize('teacher', 'admin'), assessmentController.getSubmissions);

router.route('/submissions/:submissionId/grade')
    .put(protect, authorize('teacher', 'admin'), assessmentController.gradeSubmission);

module.exports = router;
