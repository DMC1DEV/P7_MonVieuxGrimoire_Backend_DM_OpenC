const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    bookObject.year = parseInt(bookObject.year, 10);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });


    book.save()
        .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                // Suppression de l'ancienne image 
                if (req.file) {
                    const filename = book.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ message: 'Erreur lors de la suppression de l\'ancienne image' });
                        }
                        console.log('Ancienne image supprimée avec succès');
                    });
                }

                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Livre supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.rateBook = (req, res, next) => {
    const bookId = req.params.id;
    const userId = req.body.userId;
    const rating = parseInt(req.body.rating, 10);

    if (rating < 0 || rating > 5 || isNaN(rating)) {
        return res.status(400).json({ message: 'La note doit être entre 0 et 5.' });
    }

    Book.findById(bookId).then(book => {
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé.' });
        }

        if (book.ratings.some(r => r.userId.toString() === userId)) {
            return res.status(400).json({ message: 'Utilisateur a déjà noté ce livre.' });
        }

        book.ratings.push({ userId, grade: rating });

        book.averageRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length;

        book.save()
            .then(updatedBook => res.status(200).json(updatedBook))
            .catch(error => res.status(400).json({ error }));
    }).catch(error => res.status(500).json({ error }));
};

exports.getTopRatedBooks = (req, res, next) => {
    console.log("Fetching top rated books...");
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => {
            console.log("Books found:", books);
            res.status(200).json(books);
        })
        .catch(error => {
            console.error("Error fetching top rated books:", error);
            res.status(500).json({ error });
        });
};

