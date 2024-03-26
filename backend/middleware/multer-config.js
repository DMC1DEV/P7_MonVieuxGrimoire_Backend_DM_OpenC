const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

const upload = multer({ storage: storage }).single('image');

const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const imagemin = await import('imagemin');
        const imageminMozjpeg = await import('imagemin-mozjpeg');
        const imageminPngquant = await import('imagemin-pngquant');

        await imagemin.default(['images/*.{jpg,png}'], {
            destination: 'images',
            plugins: [
                imageminMozjpeg.default({ quality: 75 }),
                imageminPngquant.default({ quality: [0.6, 0.8] })
            ]
        });

        next();
    } catch (err) {
        console.error('Error optimizing image:', err);
        next(err);
    }
};

module.exports = [upload, optimizeImage];
