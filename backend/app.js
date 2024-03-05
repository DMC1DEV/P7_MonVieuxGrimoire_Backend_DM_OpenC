const express = require('express');
const Book = require('./models/book');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb+srv://celsi13:7wmqNCjEsIvwen48@cluster0.0ztr6bh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    { useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Route pour créer un nouveau livre
app.post('/api/books', (req, res, next) => {
    const { userId, title, author, imageUrl, year, genre, ratings, averageRating } = req.body;
    
    const book = new Book({
        userId,
        title,
        author,
        imageUrl,
        year,
        genre,
        ratings,
        averageRating
    });

    book.save()
        .then(() => res.status(201).json({ message: 'Livre créé avec succès !', book }))
        .catch(error => res.status(400).json({ error }));
});

app.get('/api/books', (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
});

module.exports = app;
