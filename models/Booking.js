const mongoose = require('mongoose')
const Schema = mongoose.Schema


const bookingSchema = new Schema({
    date: { // primary key
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    startHour: {
        type: String,
        required: true
    },
    endHour: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: function () {
            // Convertiamo "YYYY/MM/DD" in un oggetto Date valido
            const parts = this.date.split('/'); // Divide "AAAA/MM/GG"
            if (parts.length === 3) {
                const formattedDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T00:00:00Z`); // YYYY-MM-DDT00:00:00Z
                formattedDate.setDate(formattedDate.getDate() + 1); // Aggiunge un giorno
                return formattedDate;
            }
            return null; // Se la data è errata, evita errori
        },
        index: { expires: 0 } // TTL Index per eliminare automaticamente
    },
    friendsNumber:{
        type: Number,
        required: false
    }
})

const Booking = mongoose.model('Booking', bookingSchema)



module.exports = Booking;