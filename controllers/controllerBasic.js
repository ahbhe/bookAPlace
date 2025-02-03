const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const passport = require("passport");

exports.get_Home = (req, res) => {
  if (req.user) {
    res.redirect("/logged/allBucchins");
  } else {
    res.render("index");
  }
};

exports.get_Register = (req, res) => {
  if (req.user) {
    res.redirect("/logged/allBucchins");
  } else {
    res.render("register");
  }
};

exports.get_Login = (req, res) => {
  if (req.user) {
    res.redirect("/logged/allBucchins");
  } else {
    res.render("login");
  }
};

exports.get_AllBookings = (req, res) => {
  if (req.user) {
    res.redirect("/logged/allBucchins");
  } else {
    res.render("allBookings");
  }
};

exports.get_confirmYourEmail = (req, res) => {
  if (req.user) {
    res.redirect("/logged/allBucchins");
  } else {
    res.render("confirmYourEmail");
  }
};

exports.post_Register = (req, res) => {
  const newUser = {
    mail: req.body.mail,
    nome: req.body.nome,
    cognome: req.body.cognome,
    password: req.body.confermaPassword,
    description: "Devo pensare ad una descrizione fantasiosa",
    validated: false,
    img: "",
  };

  User.findOne({ mail: newUser.mail }).then((user) => {
    if (user) {
      //TODO: ALERT USER GIA PRESENTE
      res.redirect("/login");
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) console.log(err);
          password = hash;
          const hashedUser = newUser;
          hashedUser.password = password; // hashed pwd

          User.create(newUser)
            .then((user) => {
              res.status(200).redirect("/confirmYourEmail");

              //send mail
              const transporter = nodemailer.createTransport({
                service: "Gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                  user: "bookaplacepolito@gmail.com",
                  pass: require("../config/keys").MailPWD,
                },
              });

              const mailOptions = {
                from: "bookaplacepolito@gmail.com",
                to: user.mail,
                subject: "Benvenuto su bookAPlace!",
                text: `Ciao, benvenuto su bookAPlace, ci sei quasi. Clicca sul link per verificare il tuo account: http://localhost:5000/confirmYourEmail/${user.id}`,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Error sending email: ", error);
                } else {
                  console.log("Email sent: ", info.response);
                }
              });
            })
            .catch((err) => {
              console.error(err);
              res.status(400).redirect("/err/404");
            });
        });
      });
    }
  });
};

exports.get_mailLinkClicked = (req, res) => {
  if (req.user) {
    return res.redirect("/logged/allBucchins"); //Il return rompe il flusso
  } else {
    const id = req.params.id;
    let redirected = 0;

    User.findById(id)
      .then((user) => {
        if (!user) {
          redirected = 1;

          return res.redirect("/err/404"); // ID non valido
        } else {
          if (user.validated) {
            redirected = 1;

            return res.redirect("/login"); // Link già usato
          }
        }
        // Aggiorna l'utente e aspetta la conferma prima di procedere
        return User.findByIdAndUpdate(id, { validated: true }, { new: true });
      })
      .then((updatedUser) => {
        if (!redirected) {
          if (!updatedUser) {
            return res.redirect("/err/404"); // Fallimento nell'update
          } else {
            //login automatico
            req.logIn(updatedUser, function (err) {
              if (err) {
                return next(err);
              }
              return res.redirect("/logged/manageBucchins");
            });
          }
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(400).redirect("/err/404");
      });
  }
};

exports.post_Login = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }

    console.log("ERR: " + err);
    console.log(info);

    if (!user) {
      console.log("Errore nel login");

      if ((message = "NOT_VALIDATED")) {
        res.redirect("/confirmYourEmail");
      } else {
        return res.redirect("/login");
      }
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/logged/manageBucchins");
    });
  })(req, res, next);
};
