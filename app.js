const express = require('express')
const exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
const url = require('url');

const app = express();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var dbConnection = mongoose.connect('mongodb+srv://dravicha:cs252@boiler-wallet-3r0z7.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
})
.then(()=> console.log('Mongo connected'))
.catch(err => console.log(err));

var currentUserCodes, currentUserName, globalClubList;

require('./models/User');
require('./models/Club');
require('./models/Expense');
const User = mongoose.model('Users');
const Club = mongoose.model('Clubs');
const Expenses = mongoose.model('Expenses');
var checked = false;

// const newExpense = {
//             code: 'WISP123',
//             name: 'sam',
//             transaction: 25,
//             where: 'Donation'
//         }
//         new Expenses(newExpense)
//             .save()
//             .then(expense => {
//                 console.log("success");
//             })

// telling the system we want to use handlebars template engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(function(req,res,next){
    console.log(Date.now());
    next();
});

app.use(express.static("."));

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

app.get('/clubs', (req,res) => {
    var clubList;
    Club.find({}, function (err, myClubs){
        if(myClubs!=null){
            clubList = getClubs(myClubs);
            globalClubList = clubList;
            console.log(clubList);
            res.render('clubs', {
                clubList:clubList,
                checkNeeded: false
            });
        }
    });   
});

app.post('/myclubs', (req,res) => {
    var clubList = [];
    checked = true;
    Club.find({}, function (err, myClubs){
        if(myClubs!=null){
            clubList = getmyClubs(myClubs,currentUserCodes);
        }
        res.render('clubs',{
           clubList:clubList,
           checkNeeded: false
        });
        console.log(clubList);
    });     
});

app.get('/expenses', (req, res) => {
    var clubCode = req.query.code;
    console.log(clubCode);

    Expenses.find({code: clubCode}, function(err, myExpenses) {
        console.log("myExpenses: ", myExpenses);
        if(myExpenses != null) {
            var clubExpenses = getExpenses(myExpenses, clubCode, currentUserName);
            console.log("Array: " + clubExpenses);
        }
        res.render('expenses', {
            clubExpenses: clubExpenses
        });
    });
    //console.log(queryRes);

});

app.post('/expenseCheck', (req, res) => {
    if(checked == true){
        Club.findOne({title: req.body.name}, function(err, myClub){
            console.log(myClub.code);
            res.redirect(url.format({
                pathname:"/expenses",
                query: {
                   code: myClub.code
                }
            }));
        });  
    }
    else{
        Club.findOne({title: req.body.name}, function(err, myClub){
            console.log(myClub);
            User.findOne({name: currentUserName}, function(err, myUser){
                console.log(myUser);
                for(var i = 0; i < myUser.codes.length ; i++){
                    if(myClub.code === myUser.codes[i]){
                        checked = true;
                        console.log(myClub.code);
                        console.log(myUser.codes[i]);
                        res.redirect(url.format({
                            pathname:"/expenses",
                            query: {
                               code: myClub.code
                            }
                        }));
                    }
                }
                console.log('rendering clubs');
                res.render('clubs',{
                    clubList:globalClubList,
                    checkNeeded: true
                 });
                
            });
            
        });   
    }

});

app.post('/sign-in-submit', (req, res) => {

    let errors = [];

    if(!req.body.email){
        errors.push({text: 'Missing email address'});
    }
    if(!req.body.password){
        errors.push({text: 'Missing password'});
    }

    if(errors.length > 0){
        res.render('login', {
            errors:errors,
            email: req.body.email,
            password: req.body.password,
            
        });
    }
    else{
        const pass = req.body.password;
        User.findOne({email: req.body.email}, function (err, myUser) {
            if (myUser != null){
                if(pass === myUser.password){
                    currentUserCodes = myUser.codes;
                    currentUserName = myUser.name;
                    res.redirect('clubs');
                }
                else{
                    errors.push({text: 'Wrong password!'});
                    
                    res.render('login', {
                        errors:errors,
                        email: req.body.email,
                        password: req.body.password,
                    });
                
                }
            } 
            else{
                errors.push({text: 'Wrong login credentials!'});
                res.render('login', {
                    errors:errors,
                    email: req.body.email,
                    password: req.body.password,
                });
            }
        })
        
    }
});

const port = 5061;

server = app.listen(port, () => {
    console.log(`Server started: ${port}`);
});

/* 
    function to get the list of clubs
*/
function getClubs(myClubs){
    let clubList = []; 
    var length = myClubs.length;
    for(var i = 0; i < length ; i++){
       clubList.push(myClubs[i].title);
    }
   return clubList;
}

function getmyClubs(clubs, codes){
    let clubList = []; 
    const ilen = codes.length;
    const jlen = clubs.length;
   for(var i = 0; i < ilen; i++){
       for(var j = 0; j < jlen ; j++){
            if(codes[i] === clubs[j].code){
                clubList.push(clubs[j].title);
            }
       }
   }
   return clubList;
}

/* 
    function to get the list of expesnes by specific user
*/

function getExpenses(myExpenses, code, user) {
    let clubExpenses = [];
    const len = myExpenses.length;

    for(var i = 0; i < len; i++) {
        if(code === myExpenses[i].code && user === myExpenses[i].name) {
            var obj = {
                name: myExpenses[i].name,
                transcation: myExpenses[i].transaction,
                where: myExpenses[i].where
            }
            clubExpenses.push(obj);
        }
    }
    return clubExpenses;
}