const express = require('express')
const exphbs  = require('express-handlebars');

const app = express();


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dravicha:cs252@boiler-wallet-3r0z7.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("Wallet").collection("clubs");
  // perform actions on the collection object
  console.log('connected');
  client.close();
});

// telling the system we want to use handlebars template engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

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

const port = 5061;

app.listen(port, () => {
    console.log(`Server started: ${port}`);
});