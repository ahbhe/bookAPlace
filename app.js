const express = require('express');
const routerBasic = require('./routes/routerBasic');
const routerLogged = require('./routes/routerLogged');

const app = express();


app.use(express.static(__dirname + '/public'))


app.set('view engine', 'ejs');
app.use('/', routerBasic);
app.use('/logged', routerLogged);

module.exports = app;