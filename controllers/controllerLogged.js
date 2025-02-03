const Booking = require("../models/Booking");
const utils = require("../config/utils")
exports.get_AllBookingsLogged = (req, res) => {
  res.render("allBookingsLogged", { user: req.user });
};

exports.get_ManageBookings = (req, res) => {
  Booking.find({ userId: req.user._id })
    .sort({ date: 1, startHour: 1, endHour:1})
    .then((bookings) => {
        compacted_bookings = utils.transformToDictArray(bookings)
      res.render("manageBookingsLogged", { user: req.user, bookings:compacted_bookings });
    });
};

exports.get_MyProfile = (req, res) => {
  res.render("myProfileLogged", { user: req.user });
};

exports.get_Logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.post_CreateBooking = (req, res) => {
  if (req.body.copiedHoursInput) {
    //Copia da altro elemento
    // Splitto utilizzando il / come carattere
    let copiedHoursInput = req.body.copiedHoursInput;
    let ch = " ";
    let regex = new RegExp(ch, "g");
    let trimmedCopiedHoursInput = copiedHoursInput.replace(regex, "");
    let hourIntervals = trimmedCopiedHoursInput.split("/");

    let nIntervals = hourIntervals.length;
    console.log("Numero di intervalli: ", nIntervals);
     //07:00 - 08:30 / 08:30 - 10:00 / 11:30 - 13:00 / 14:30 - 16:00 / 19:00 - 20:30
    // Array per raccogliere tutte le promesse
    let promises = hourIntervals.map((interval) => {
      console.log("Processando intervallo:", interval);
      let hours = interval.split("-");
      let newBooking = {
        date: req.body.date,
        userId: req.user._id,
        startHour: hours[0],
        endHour: hours[1],
      };

      return Booking.findOne({
        date: newBooking.date,
        userId: newBooking.userId,
        startHour: newBooking.startHour,
        endHour: newBooking.endHour,
      })
        .then((booking) => {
          if (booking) {
            console.log("Booking already exists for", newBooking);
          } else {
            // Restituisci la promise creata da Booking.create()
            return Booking.create(newBooking);
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    });

    // Aspetta che tutte le promesse siano completate
    Promise.all(promises)
      .then(() => {
        // Ora tutte le operazioni sono completate
        res.redirect("/logged/manageBucchins");
      })
      .catch((err) => {
        // Gestisci eventuali errori
        res.redirect("/err/500");
      });
  } else {
    const newBooking = {
      date: req.body.date,
      userId: req.user._id,
      startHour: req.body.startHour,
      endHour: req.body.endHour,
    };

    Booking.findOne({
      date: newBooking.date,
      userId: newBooking.userId,
      startHour: newBooking.startHour,
      endHour: newBooking.endHour,
    })
      .then((booking) => {
        if (booking) {
          console.log("Booking already exists!");
          res.redirect("/logged/manageBucchins");
        } else {
          Booking.create(newBooking);
          res.redirect("/logged/manageBucchins");
        }
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/err/500");
        return;
      });
  }
};

exports.delete_DeleteBooking = (req, res) => {
  Booking.deleteOne({ _id: req.params.id }).catch((err) => {
    console.log("ERROR DELETING BOOKING: " + err);
  });

  res.redirect("/logged/manageBucchins");
};
