const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Load User model
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "mail" }, (mail, password, done) => {
      // Match user
      User.findOne({
        mail: mail,
      }).then((user) => {
        if (!user) {
          //TODO Gestire questa cosa
          return done(null, false, { message: "That email is not registered" });
        }
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            //TODO Alert password errata
            return done(null, false, { message: "Password incorrect" });
          }
        });
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id)
      .then((user) => {
        done(null, user); //NB, il primo parametro di done deve essere null per segnalare la mancanza di errori
      })
      .catch((err) => {
        done(err, null); //Passa errore al posto di null, giustamente
      });
  });
};
