const express = require('express')
const exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');

const app = express();

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var dbConnection = mongoose.connect('mongodb+srv://dravicha:cs252@boiler-wallet-3r0z7.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
})
.then(()=> console.log('Mongo connected'))
.catch(err => console.log(err));


require('./models/User');
const User = mongoose.model('Users');

// telling the system we want to use handlebars template engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://dravicha:cs252@boiler-wallet-3r0z7.mongodb.net/test?retryWrites=true";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// var con, db, server;
// var connected = false;


// const startMongo = async function(){
//     try {
//         con = await client.connect();
//         db = con.db("Wallet");
//         const collection = db.collection("Users");
//         console.log('connected to Database Wallet');
//         connected = true;
//     } catch (error) {
//         console.log(error);
//         return -1;
//     }
//     return 0;
// }


// async function stopMongo(){
//     try{
//         if(typeof con !== 'undefined'){
//             con.close();
//             console.log("stopped Mongo")
//         }
//     }
//     catch (error) {
//         console.log(error)
//     }
// }

// process.on('SIGINT', shutdown);

// // Do graceful shutdown
// function shutdown() {
//   console.log('graceful');
//   stopMongo();
//   server.close();
// }

// client.connect(err => {
//   const collection = client.db("Wallet").collection("Users");
//   // perform actions on the collection object
//   console.log('connected');
// //   const ins= {
// //     name: 'Sam',
// //     password: 'scoe',
// //     codes: ['AXMYCZS', 'WISP123']
// //   };
// //   collection.insertOne(ins);
//     client.close();
// });

//startMongo();

// (async () => {
//     await startMongo();
//     console.log(db);
// })()



// setTimeout(function() {
//     // prints out "2", meaning that the callback is not called immediately after 500 milliseconds.
//     console.log("Ran after " + (new Date().getSeconds() - s) + " seconds");
//   }, 500);


// const collection = db.collection('Users');
// console.log(typeof collection);
// console.log("here");
// const ins= {
//     name: '',
//     password: 'scoe',
//     codes: ['AXMYCZS', 'WISP123']
// };
// collection.insertOne(ins);

app.use(function(req,res,next){
    console.log(Date.now());
    next();
});

app.get('/', (req,res) => {
    const title = 'Passing a variable into the view';
    res.render('login', {
        title:title
    }); 
});

app.get('/about', (req,res) => {
    res.render('ABOUT');
});

app.get('/contact', (req,res) => {
    res.render('CONTACT');
});

app.post('/login', (req,res) =>{
    console.log(req.body);
    res.send('ok');

    let errors = [];

    if(!req.body.email){
        errors.push({text: 'Missing email address'});
    }
    if(!req.body.password){
        errors.push({text: 'Missing password'});
    }

    if(errors.length > 0){
        res.render('/', {
            errors:errors,
            email: req.body.email,
            password: req.body.password
        });
    }
    else{
        res.send('passed');
    }
});

app.post('/sign-in-submit', (req, res) => {
    // dbConnection.then(function(db){
    //     delete req.body._id;
    //     db.collection('Users').insertOne(req.body);
    //     //var value = db.collection('Users').count();
    //     //console.log(value);
    // });
    let errors = [];

    if(!req.body.email){
        errors.push({text: 'Missing email address'});
    }
    if(!req.body.password){
        errors.push({text: 'Missing password'});
    }

    if(errors.length > 0){
        res.render('/', {
            errors:errors,
            email: req.body.email,
            password: req.body.password
        });
    }
    else{
        console.log(req.body);
        res.send('User data received now: \n' + JSON.stringify(req.body.inputEmail));
    }
});

const port = 5061;

server = app.listen(port, () => {
    console.log(`Server started: ${port}`);
});