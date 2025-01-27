const express = require('express');
const routerBasic = require('./routes/routerBasic');

const app = express();


app.use(express.static(__dirname + '/public'))


app.set('view engine', 'ejs');
app.use('/', routerBasic);

module.exports = app;