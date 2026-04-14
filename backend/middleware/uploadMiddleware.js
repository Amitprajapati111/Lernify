const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    }
});

// Init upload
const upload = multer({
    storage,
    limits: { fileSize: 50000000 } // 50MB
});

module.exports = upload;
