const Booking = require("../models/Booking");
const User = require("../models/User");
const utils = require("../config/utils");
const SeatHolder = require("../models/seatHolder");
const fs =  require("fs");


exports.get_AllBookingsLogged = (req, res) => {
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
            res.render("allBookingsLogged", {
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
};

exports.get_ManageBookings = (req, res) => {
  Booking.find({ userId: req.user._id })
    .sort({ date: 1, startHour: 1, endHour: 1 })
    .then((bookings) => {
      compacted_bookings = utils.transformToDictArray(bookings);
      res.render("manageBookingsLogged", {
        user: req.user,
        bookings: compacted_bookings,
      });
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

exports.delete_DeleteManyBookings = (req, res) => {
  correctDate = req.params.date.replaceAll("_", "/");

  Booking.deleteMany({ userId: req.user._id, date: correctDate })
    .catch((err) => {
      console.log("ERROR DELETING BOOKINGS: " + err);
    })
    .then(() => {
      res.redirect("/logged/manageBucchins");
    });
};

exports.post_toggleseatHolder = (req, res) => {

  SeatHolder.findOne({
    date: req.body.seatHolderDate,
    userId: req.user._id,
  }).then((seatHolder) => {
    console.log(seatHolder);
    if (seatHolder) {
      //doNothing already holding seats
      if (req.body.willHoldSeats) {
        date = req.body.seatHolderDate;
        res.redirect("/logged/allBucchins?date=" + date);
      } else {
        //delete seatHolder
        SeatHolder.deleteOne({
          date: req.body.seatHolderDate,
          userId: req.user._id,
        }).then(() => {
          date = req.body.seatHolderDate;
          res.redirect("/logged/allBucchins?date=" + date);
        });
      }
    } else {
      if (req.body.willHoldSeats) {
        newseatHolder = {
          date: req.body.seatHolderDate,
          userId: req.user._id,
        };

        SeatHolder.create(newseatHolder).then(() => {
          date = req.body.seatHolderDate;
          res.redirect("/logged/allBucchins?date=" + date);
        });
      } else {
        date = req.body.seatHolderDate;
        res.redirect("/logged/allBucchins?date=" + date);
      }
    }
  });
};


exports.post_editDesc = (req, res) =>{
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { description: req.body.newDescription } },
    { new: true }
  ).then((user)=>{
    res.redirect("/logged/myProfile")
  });
}

exports.post_editPic = (req, res) =>{
  console.log(req.file);
  //req.file.path contiene il percorso

  newImgPath = req.file.path.replace("public/", "");
  oldImgPath = `./public/${req.user.img}`;

  console.log(newImgPath)
  User.findOneAndUpdate({_id: req.user._id},
    {$set: {img: newImgPath}},
    {new: true}
  ).then((user) =>{
    //Cancella vecchia immagine
    console.log(oldImgPath)
    if(oldImgPath != "./public/"){
      fs.unlink(oldImgPath, (err) => {
        if (err) throw err;
        console.log('path/file.txt was deleted');
      }); 
    }
    res.redirect("/logged/myProfile")
  })
  
}

exports.get_profile = ((req, res) =>{
  User.findById(req.params.id).then((user)=>{
    res.render('profileLogged', {selectedUser: user, user:req.user});
  })
})