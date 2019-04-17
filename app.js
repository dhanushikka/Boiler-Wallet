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

var currentUserCodes, currentUserName, globalClubList, currentClubCode, sum = 0;


require('./models/User');
require('./models/Club');
require('./models/Expense');
const User = mongoose.model('Users');
const Club = mongoose.model('Clubs');
const Expenses = mongoose.model('Expenses');
var checked = false, exp = false;

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
    checked = false;
    console.log("All clubs")
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


app.post('/download', (req,res) => {
    exportToCsv();   
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
        checked = false;
        console.log(clubList);
    });     
});

app.get('/expenses', (req, res) => {
   
    var clubCode = req.query.code;
    currentClubCode = clubCode;
    console.log(clubCode);

    Expenses.find({code: clubCode}, function(err, myExpenses) {

        if(myExpenses != null) {
            var clubExpenses = getExpenses(myExpenses, clubCode, currentUserName);
            console.log("Array: " + clubExpenses);
        }

        // Club.find({code: clubCode}, function(err, currClub) {
        //     if(currClub != null) {
        //         var clubBudget = currClub[0].budget + sum;
        //     }

            res.render('expenses', {
                clubExpenses: clubExpenses,
                budget: sum, //clubBudget,
                user: currentUserName
            });
        // });
    });

});

app.get('/check', (req,res) => {
    res.render('check', {
        
    });
});

app.post('/transaction', (req, res) => {
    const newExpense = {
            code: currentClubCode,
            name: req.body.name,
            transaction: req.body.amount,
            where: req.body.where
    }
    new Expenses(newExpense)
            .save()
            .then(expense => {
                console.log("success");
    })

    res.redirect(url.format({
        pathname:"/expenses",
        query: {
           code: currentClubCode
        }
    }));
});

app.post('/expenseCheck', (req, res) => {
    exp = false;
    if(checked == true){
        console.log(req.body.name + " " +checked);
        Club.findOne({title: req.body.name}, function(err, myClub){
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
                        exp = true;
                        console.log("g: " + myClub.code);
                        console.log("u: " +myUser.codes[i]);
                        res.redirect(url.format({
                            pathname:"/expenses",
                            query: {
                               code: myClub.code
                            }
                        }));
                    }
                }
                console.log(req.body);
            
                if(exp == false)
                res.redirect(url.format({
                    pathname:"/check",
                        query: {
                            clubList:globalClubList,
                            checkNeeded: true
                        }
                }));
                
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
    sum = 0;
    for(var i = 0; i < len; i++) {
        if(code === myExpenses[i].code) {
            sum = sum + myExpenses[i].transaction;
            var obj = {
                name: myExpenses[i].name,
                transaction: myExpenses[i].transaction,
                where: myExpenses[i].where
            }

            clubExpenses.push(obj);
        }
    }

    return clubExpenses;
}

function exportToCsv() {
    var myCsv = "Col1,Col2,Col3\nval1,val2,val3";
    // console.log(clubExpenses);
    // for(var i = 0; i < clubExpenses.length ; i++){
        
    // }
    console.log(global);
    //global.window.open('data:text/csv;charset=utf-8,' + escape(myCsv));
}

