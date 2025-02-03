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
    const { date, startHour, endHour } = booking;

    // Cerchiamo se la data è già presente nell'array
    let existingDate = result.find((item) => item.date === date);

    // Se la data non è ancora presente, la aggiungiamo con una stringa di intervalli
    if (!existingDate) {
      result.push({
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
