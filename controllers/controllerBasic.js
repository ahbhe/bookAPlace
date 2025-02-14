const User = require("../models/User");
const Booking = require('../models/Booking')
const SeatHolder = require('../models/SeatHolder')
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const passport = require("passport");
const utils = require("../config/utils");


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
    date = req.query.date;
    if (!date) {
      date = new Date();
      month = date.getMonth() + 1;
      if (month < 10) month = `0${month}`;
  
      day = date.getDate();
      if (day < 10) day = `0${day}`;
      date = `${date.getFullYear()}/${month}/${day}`;
    }
  
    attendances = [
      { startHour: "0700", endHour: "0830", users: new Array() },
      { startHour: "0830", endHour: "1000", users: new Array() },
      { startHour: "1000", endHour: "1130", users: new Array() },
      { startHour: "1130", endHour: "1300", users: new Array() },
      { startHour: "1300", endHour: "1430", users: new Array() },
      { startHour: "1430", endHour: "1600", users: new Array() },
      { startHour: "1600", endHour: "1730", users: new Array() },
      { startHour: "1730", endHour: "1900", users: new Array() },
      { startHour: "1900", endHour: "2030", users: new Array() },
    ];
    Booking.find({ date: date })
      .then((bookings) => {
        users = new Map();
  
        const userPromises = bookings.map((booking) =>
          User.findOne({ _id: booking.userId }).then((user) => {
            if (user) {
              users.set(user._id.toHexString(), user);
            }
          })
        );
  
        Promise.all(userPromises).then(() => {
          if (bookings.length) {
            attendances = utils.computeAttendance(bookings, users);
          }
  
          SeatHolder.find({ date: date }).then((seatHolders) => {
            // Creiamo un array di promesse
            const promises = seatHolders.map(async (seatHolder) => {
              const user = await User.findById(seatHolder.userId);
              if (user) {
                seatHolder["img"] = user.img;
                seatHolder["nome"] = user.nome;
                seatHolder["cognome"] = user.cognome;
              }
              return seatHolder;
            });
  
            // Aspettiamo che tutte le promesse siano risolte
            Promise.all(promises).then((updatedSeatHolders) => {
              res.render("allBookings", {
                user: req.user,
                attendances,
                date,
                seatHolders: updatedSeatHolders,
              });
            });
          });
        });
      })
      .catch((err) => {
        console.log("error: " + err);
      });
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

    if (!user) {
      console.log("Errore nel login");
      console.log(info)
      if (info.message == "NOT_VALIDATED") {
        res.redirect("/confirmYourEmail");
      } else {
          req.flash(
            "error",
            "È stata inserita una mail o una password errata"
          );
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

exports.get_profile = (req, res) => {
  User.findById(req.params.id).then((user) => {
    res.render("profile", { selectedUser: user, user: req.user });
  });
};