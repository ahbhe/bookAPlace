exports.userCheck = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/err/401");
  }
};

exports.transformToDictArray = (collection) => {
  // Creiamo un array per raccogliere i risultati
  let result = [];

  // Iteriamo sulla collezione
  collection.forEach((booking) => {
    const {_id, date, startHour, endHour } = booking;

    // Cerchiamo se la data è già presente nell'array
    let existingDate = result.find((item) => item.date === date);

    // Se la data non è ancora presente, la aggiungiamo con una stringa di intervalli
    if (!existingDate) {
      result.push({
        _id,
        date,
        hourIntervals: `${startHour} - ${endHour}`
      });
    } else {
      // Se la data esiste già, aggiungiamo l'intervallo alla stringa esistente
      existingDate.hourIntervals += ` / ${startHour} - ${endHour}`;
    }
  });

  return result;
};

exports.computeAttendance = (bookings, users) =>{
  attendance=[
    {startHour:"0700", endHour:"0830", users: new Array()},
    {startHour:"0830", endHour:"1000", users: new Array()},
    {startHour:"1000", endHour:"1130", users: new Array()},
    {startHour:"1130", endHour:"1300", users: new Array()},
    {startHour:"1300", endHour:"1430", users: new Array()},
    {startHour:"1430", endHour:"1600", users: new Array()},
    {startHour:"1600", endHour:"1730", users: new Array()},
    {startHour:"1730", endHour:"1900", users: new Array()},
    {startHour:"1900", endHour:"2030", users: new Array()},
  ]
 
  bookings.forEach((booking) => {
    startHourEff = booking.startHour.replaceAll(":", "");
    endHourEff = booking.endHour.replaceAll(":", "");

    let foundStartHour = false;

    for (let currentTimeSpan of attendance) {
      bookingUser = users.get(booking.userId);
      if(startHourEff == currentTimeSpan.startHour && ! foundStartHour){
        //Non potrà essere minore, al più maggiore e in quel caso skip

        currentTimeSpan.users.push({nome: bookingUser.nome, cognome: bookingUser.cognome, 
          img: bookingUser.img, _id: bookingUser._id});

        if(endHourEff == currentTimeSpan.endHour){
          break;
        }
      }else{
        if(endHourEff > currentTimeSpan.endHour){
          currentTimeSpan.users.push({nome: bookingUser.nome, cognome: bookingUser.cognome, 
            img: bookingUser.img, _id: bookingUser._id});
        }

        if(endHourEff == currentTimeSpan.endHour){
          currentTimeSpan.users.push({nome: bookingUser.nome, cognome: bookingUser.cognome, 
            img: bookingUser.img, _id: bookingUser._id});

          break;
        }
      }
    }
  }) 

  return attendance;
}
