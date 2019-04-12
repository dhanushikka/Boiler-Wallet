const express = require('express')
var exphbs  = require('express-handlebars');

const app = express();

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
    res.render('index', {
        title:title
    });
});

app.get('/about', (req,res) => {
    res.render('ABOUT');
});

const port = 5061;

app.listen(port, () => {
    console.log(`Server started: ${port}`);
});