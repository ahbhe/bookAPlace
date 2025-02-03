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
    }
})

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking;