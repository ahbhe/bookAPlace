const app = require('./app');

const express = require('express');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log(`BookAPlace ~ Currently listening on port ${PORT}`);
});

let db = require('./config/keys').MongoURI;
mongoose.connect(db);

db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () =>{
    console.log('BookAPlace ~ MongoDB Connected');
})