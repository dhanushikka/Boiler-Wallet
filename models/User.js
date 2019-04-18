const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const UserSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        unique : true,
        required: true,
        dropDups: true
    },
    password:{
        type: String,
        required: true
    },
    codes: {
        type: Array,
        required: false
    }
});

mongoose.model('Users', UserSchema);