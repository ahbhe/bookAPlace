const express = require("express");
const morgan = require('morgan')
const passport = require('passport');
const session = require('express-session')
const methodOverride = require('method-override')
var bodyParser = require('body-parser')

const flash = require('express-flash')

const app = express();

const routerBasic = require("./routes/routerBasic");
const routerLogged = require("./routes/routerLogged");
const routerError = require("./routes/routerError");



require('./config/passport.js')(passport);


app.use(express.static(__dirname + "/public"));

// parse application/json
app.use(bodyParser.json())


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'))

app.use(flash())


app.use(session({
  secret: require('./config/keys').SessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {_expires : 60000000}
}) )

app.use(passport.initialize());
app.use(passport.session());




app.set("view engine", "ejs");

app.use(morgan('dev'))





app.use("/", routerBasic);
app.use("/logged", routerLogged);
app.use("/err", routerError);


//If route is not existant -> error404
app.get("/*", function (req, res) {
  res.redirect("/err/404");
});

module.exports = app;
