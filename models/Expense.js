const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
    code:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    transaction:{
        type: Number,
        required: true
    },
    where:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Expenses', ExpenseSchema);
