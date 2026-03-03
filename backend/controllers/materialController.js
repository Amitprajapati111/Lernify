const Material = require('../models/Material');

// @desc    Upload new study material
// @route   POST /api/materials
// @access  Private/Teacher
const uploadMaterial = async (req, res) => {
    try {
        const { title, description, subject, type, folderName } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;

        const material = await Material.create({
            title,
            description,
            subject,
            teacher: req.user.id,
            type,
            fileUrl,
            folderName
        });

        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get materials by subject
// @route   GET /api/materials/subject/:subjectId
// @access  Public
const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ subject: req.params.subjectId })
            .populate('teacher', 'name');
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadMaterial,
    getMaterials
};
