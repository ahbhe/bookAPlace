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
          
        for(let i = 0; i < booking.friendsNumber; i++){
          currentTimeSpan.users.push({nome:"Amico di", cognome:bookingUser.nome + " " + bookingUser.cognome, img: bookingUser.img, _id: bookingUser._id});
        }

        if(endHourEff == currentTimeSpan.endHour){
          break;
        }
        foundStartHour = true;

      }else{
        if(endHourEff >= currentTimeSpan.endHour && startHourEff <= currentTimeSpan.startHour){
          if(!currentTimeSpan.users.some(user => user._id === bookingUser._id)){
          currentTimeSpan.users.push({nome: bookingUser.nome, cognome: bookingUser.cognome, 
            img: bookingUser.img, _id: bookingUser._id});
          }

          for(let i = 0; i < booking.friendsNumber; i++){
            currentTimeSpan.users.push({img: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"});
          }

          if(endHourEff == currentTimeSpan.endHour){
            break;
          }

        }
      }
    }
  }) 

  return attendance;
}

exports.findMissingIntervals =(bookings, newBookings) =>{
  const timeToMinutes = (time) => {
      let [h, m] = time.split(":").map(Number);
      return h * 60 + m;
  };

  const minutesToTime = (minutes) => {
      let h = Math.floor(minutes / 60);
      let m = minutes % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  if (newBookings.length === 0) return [];

  // Prendiamo il primo elemento di newBookings come riferimento per userId e altri parametri
  const referenceBooking = newBookings[0];
  const referenceData = { userId: referenceBooking.userId, date: referenceBooking.date, friendsNumber: referenceBooking.friendsNumber };

  let bookingIntervals = bookings.map(booking => ({
      start: timeToMinutes(booking.startHour),
      end: timeToMinutes(booking.endHour)
  }));

  let newBookingIntervals = newBookings.map(booking => ({
      start: timeToMinutes(booking.startHour),
      end: timeToMinutes(booking.endHour)
  }));

  // Ordiniamo bookingIntervals per startHour
  bookingIntervals.sort((a, b) => a.start - b.start);

  let missingIntervals = [];

  for (let newBooking of newBookingIntervals) {
      let { start: newStart, end: newEnd } = newBooking;
      let currentStart = newStart;

      for (let book of bookingIntervals) {
          let { start: bookStart, end: bookEnd } = book;

          // Se il nuovo intervallo finisce prima dell'inizio di un intervallo già esistente, è completamente libero
          if (newEnd <= bookStart) {
              break;
          }

          // Se il nuovo intervallo inizia dopo un intervallo esistente, saltiamo al prossimo
          if (currentStart >= bookEnd) {
              continue;
          }

          // Se c'è un buco tra currentStart e bookStart, lo aggiungiamo
          if (currentStart < bookStart) {
              missingIntervals.push({
                  startHour: minutesToTime(currentStart),
                  endHour: minutesToTime(bookStart),
                  ...referenceData
              });
          }

          // Aggiorniamo il currentStart alla fine dell'intervallo coperto
          if (currentStart < bookEnd) {
              currentStart = bookEnd;
          }
      }

      // Se alla fine currentStart è ancora inferiore a newEnd, aggiungiamo l'ultima parte mancante
      if (currentStart < newEnd) {
          missingIntervals.push({
              startHour: minutesToTime(currentStart),
              endHour: minutesToTime(newEnd),
              ...referenceData
          });
      }
  }

  return missingIntervals;
}
