const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { protect, authorize, checkStudentAccess } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, authorize('teacher', 'admin'), upload.single('file'), materialController.uploadMaterial);

router.route('/subject/:subjectId')
    .get(protect, checkStudentAccess, materialController.getMaterials);

module.exports = router;
