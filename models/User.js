const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    Name:{
        type: String,
        required: true
    },
    Password:{
        type: String,
        required: true
    },
    codes: {
        type: Array,
        required: false
    }
});

mongoose.model('Users', UserSchema);