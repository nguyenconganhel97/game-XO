const express = require('express');
const app = new express();

const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const engines = require('consolidate');
const morgan = require('morgan');


app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  // resave: true,
  // saveUninitialized: true,
  // cookie: { secure: true }
}));

app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('short'));
app.use(express.json());
app.set('views', __dirname + '/html');
app.set('html', 'ejs');
app.engine('html', engines.mustache);
app.set('view engine', 'ejs');
global.__root   = __dirname + '/'; 
var serv = require('http').Server(app);
serv.listen(port);
console.log("Server started.");

app.get('/', function(req,res){
    if(req.session.user){
      return res.render('carogame.ejs',{username:req.session.user.username,token:req.session.user.token});
    }else{
      res.redirect('/qltk/');
    }
   
});

var testapi=require(__root+'controller/testapi.js');

app.use('/test',testapi);

var taikhoan=require(__root+'controller/taikhoan.js');
app.use('/qltk',taikhoan);

var caroSocketServer=require(__root+'controller/CaroController.js');
app.use('/carosocket',caroSocketServer);