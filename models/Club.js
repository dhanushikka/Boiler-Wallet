const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClubSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    code:{
        type: String,
        required: true
    },
    budget:{
        type: Number,
        required: true
    }
});

mongoose.model('Clubs', ClubSchema);