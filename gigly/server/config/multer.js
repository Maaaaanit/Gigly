const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const imageFilter = (req, file, cb) => {
  /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())
    ? cb(null, true) : cb(new Error('Only images allowed'));
};

const docFilter = (req, file, cb) => {
  /jpeg|jpg|png|pdf|doc|docx/.test(path.extname(file.originalname).toLowerCase())
    ? cb(null, true) : cb(new Error('Only images and documents allowed'));
};

exports.uploadAvatar = multer({ storage: createStorage('avatars'), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: imageFilter });
exports.uploadDocument = multer({ storage: createStorage('documents'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: docFilter });
exports.uploadMilestone = multer({ storage: createStorage('milestones'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: docFilter });
exports.uploadContract = multer({ storage: createStorage('contracts'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: docFilter });
