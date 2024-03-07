const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://celsi13:7wmqNCjEsIvwen48@cluster0.0ztr6bh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.json());

app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
