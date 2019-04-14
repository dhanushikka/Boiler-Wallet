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
    res.render('clubs');
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