const express = require("express");
const morgan = require('morgan')
const methodOverride = require('method-override')
var bodyParser = require('body-parser')

const app = express();

const routerBasic = require("./routes/routerBasic");
const routerLogged = require("./routes/routerLogged");
const routerError = require("./routes/routerError");
const passport = require('passport');
const session = require('express-session')

require('./config/passport.js')(passport);


app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.use(morgan('dev'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'))


app.use(session({
  secret: require('./config/keys').SessionSecret,
  resave: true,
  saveUninitialized: true,
  cookie: {_expires : 60000000}
}) )

app.use(passport.initialize());
app.use(passport.session());



app.use("/", routerBasic);
app.use("/logged", routerLogged);
app.use("/err", routerError);


//If route is not existant -> error404
app.get("/*", function (req, res) {
  res.redirect("/err/404");
});

module.exports = app;
