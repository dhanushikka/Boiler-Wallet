const express = require('express')
const exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
const url = require('url');
const bcrypt = require('bcrypt');




const app = express();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var dbConnection = mongoose.connect('mongodb+srv://dravicha:cs252@boiler-wallet-3r0z7.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
})
.then(()=> console.log('Mongo connected'))
.catch(err => console.log(err));

var currentUserCodes, currentUserName, globalClubList, currentClubCode,currentClubName, sum = 0;
const saltRounds = 10;

require('./models/User');
require('./models/Club');
require('./models/Expense');
const User = mongoose.model('Users');
const Club = mongoose.model('Clubs');
const Expenses = mongoose.model('Expenses');
var checked = false, exp = false;

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

// to use css files
app.use(express.static("."));

/*
    function to display login page
*/
app.get('/', (req,res) => {
    const title = 'Passing a variable into the view';
    res.render('login', {
        reg:false
    }); 
});


/*
    ABOUT page
*/
app.get('/about', (req,res) => {
    res.render('about');
});


/*
    CONTACT page
*/
app.get('/contact', (req,res) => {
    res.render('CONTACT');
});


/*
    ALL CLUBS
*/
app.get('/clubs', (req,res) => {
    var clubList;
    checked = false;
    //console.log("All clubs")
    Club.find({}, function (err, myClubs){
        if(myClubs!=null){
            clubList = getClubs(myClubs);
            globalClubList = clubList;
            //console.log(clubList);
            if(currentUserName === "admin"){
                res.render('clubs', {
                    clubList:clubList,
                    checkNeeded: false,
                    admin: true
                });
            }
            else{
                res.render('clubs', {
                    clubList:clubList,
                    checkNeeded: false,
                    admin: false
                }); 
            }
            
        }
    });   
});


app.get('/addclub', (req,res) => {
    res.render('addclub', {
        
    });  
});

app.post('/download', (req,res) => {
    exportToCsv();   
}); 

app.post('/createclub', (req,res) => {

    const newClub = {
                title: req.body.title,
                code: req.body.code,
                budget: req.body.budget
        }
        new Club(newClub)
                .save()
                .then(club => {
                    console.log("success");
        })
    res.redirect('clubs');
        
}); 

/*
    USER SPECIFIC CLUBS
*/
app.post('/myclubs', (req,res) => {
    var clubList = [];
    checked = true;
    
    Club.find({}, function (err, myClubs){
        if(myClubs!=null){
            clubList = getmyClubs(myClubs,currentUserCodes);
        }
        if(currentUserName === "admin"){
            res.render('clubs',{
            clubList:clubList,
            checkNeeded: false,
            admin: true
            });
        }
        else{
            res.render('clubs',{
                clubList:clubList,
                checkNeeded: false,
                admin: false
                }); 
        }
        checked = false;

    });     
});


/*
    EXPENSES PAGE
*/
app.get('/expenses', (req, res) => {
   
    var clubCode = req.query.code;
    currentClubCode = clubCode;
    

    Expenses.find({code: clubCode}, function(err, myExpenses) {

        if(myExpenses != null) {
            var clubExpenses = getExpenses(myExpenses, clubCode, currentUserName);

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
    if(currentUserName === "admin"){
    
        res.render('check', {
            admin: true
        });
    }
    else{
        res.render('check', {
            admin: false
        });
    }
});

app.get('/sign-up', (req,res) => {
    res.render('register', {
    });
});

app.post('/transaction', (req, res) => {
    const newExpense = {
            code: currentClubCode,
            name: req.body.name,
            transaction: req.body.amount,
            where: req.body.where,
            date: getD()
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

app.post('/codeverify', (req,res) => {
    console.log(req.body);
    Club.findOne({title: currentClubName}, function(err, myClub){
        if(err){
            res.redirect('clubs');
        }
        if(req.body.code === myClub.code){

            /* TODO: find and update */
            User.updateOne({name: currentUserName}, {$push: {codes: myClub.code}}, function(err, match){
                    console.log("Club added to user's list!");
            });

            /* end of find and update */ 


            res.redirect(url.format({
                pathname:"/expenses",
                query: {
                   code: myClub.code
                }
            })); 
        }
        else{
            res.redirect('clubs');
        }
        
    });
});

app.post('/register', (req, res) => {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = {
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
            }
            new User(newUser)
                    .save()
                    .then(user => {
                        console.log("success");
            })
        
            res.render('login', {
                reg:true
            });
    });
     
});

app.post('/expenseCheck', (req, res) => {
    currentClubName = req.body.name;
    
    exp = false;
    if(checked == true){
        console.log("clicked club:", req.body.name);
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

            User.findOne({name: currentUserName}, function(err, myUser){
  
                for(var i = 0; i < myUser.codes.length ; i++){
                    if(myClub.code === myUser.codes[i]){
                        exp = true;

                        res.redirect(url.format({
                            pathname:"/expenses",
                            query: {
                               code: myClub.code
                            }
                        }));
                    }
                }
    
            
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
            reg : false,
            errors:errors,
            email: req.body.email,
            password: req.body.password,
            
        });
    }
    else{
        const pass = req.body.password;
        User.findOne({email: req.body.email}, function (err, myUser) {
            if (myUser != null){
                bcrypt.compare(pass, myUser.password, function(err, result) {
                    // res == true
                    if(result == true){
                        currentUserCodes = myUser.codes;
                        currentUserName = myUser.name;
                        res.redirect('clubs');
                    }
                    else{
                        errors.push({text: 'Wrong password!'});
                        
                        res.render('login', {
                            reg: false,
                            errors:errors,
                            email: req.body.email,
                            password: req.body.password,
                        });
                    
                    }
                });
                // if(pass === myUser.password){
                //     currentUserCodes = myUser.codes;
                //     currentUserName = myUser.name;
                //     res.redirect('clubs');
                // }
                
                // else{
                //     errors.push({text: 'Wrong password!'});
                    
                //     res.render('login', {
                //         reg: false,
                //         errors:errors,
                //         email: req.body.email,
                //         password: req.body.password,
                //     });
                
                // }
            } 
            else{
                errors.push({text: 'Wrong login credentials!'});
                res.render('login', {
                    reg: false,
                    errors:errors,
                    email: req.body.email,
                    password: req.body.password,
                });
            }
        })
        
    }
});

const port = process.env.PORT || 5061;

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
                where: myExpenses[i].where,
                date: myExpenses[i].date
            }

            clubExpenses.push(obj);
        }
    }

    return clubExpenses.reverse();
}

function getD()
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; // January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm}
    today = yyyy+"/"+mm+"/"+dd;
    return today;
    //document.getElementsByName("date").value = today;
    
}
