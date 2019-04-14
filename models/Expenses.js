const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpensesSchema = new Schema({
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

mongoose.model('Expenses', ExpensesSchema);