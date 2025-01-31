const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
    mail: { // primary key
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    nome: {
        type: String,
        required: true
    },
    cognome: {
        type: String,
        required: true
    },
    img: {
        type: String,
    },
    validated:{
        type: Boolean,
    },
    description:{
        type:String,
    }

})

const User = mongoose.model('User', userSchema)
module.exports = User;