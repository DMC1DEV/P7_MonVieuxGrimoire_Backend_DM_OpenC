const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs').promises;

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// Stockage Multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];

        if (!extension) {
            return callback(new Error('Type de fichier non supporté'), null);
        }
        callback(null, `${name}${Date.now()}.${extension}`);
    }
});

// Configuration upload
const upload = multer({ storage: storage }).single('image');

// Optimisation image
const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const originalPath = 'images/' + req.file.filename;
    const outputPath = originalPath.replace(/\.[^/.]+$/, "") + '.optimized.jpeg';

    try {
        await sharp(originalPath)
            .resize({ width: 400, height: 600 })
            .toFormat('jpeg')
            .jpeg({ quality: 75 })
            .toFile(outputPath);

        // Suppression image originale après optimisation
        await fs.unlink(originalPath);

        // Nouvelle image optimisée
        req.file.path = outputPath;
        req.file.filename = outputPath.split('/').pop();

        next();
    } catch (err) {
        console.error('Error optimizing image:', err);
        return next(err);
    }
};

module.exports = [upload, optimizeImage];
