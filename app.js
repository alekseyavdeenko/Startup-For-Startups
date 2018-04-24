var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mongodb = require('mongodb');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var session = require('express-session');
//var session = require('session');
const MongoStore = require('connect-mongo')(session);

var mongo = require('mongodb');

var index = require('./routes/index');
var user = require('./routes/user');
var login = require('./routes/login');
var question = require('./routes/question');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

//const connection = mongoose.createConnection(connectionOptions);

app.use(session({
    secret:'max',
    saveUninitialized:false,
    resave:false,
    store:new MongoStore({
        url:"mongodb://localhost:27017/startup"
    }),
    cookie:{maxAge:10*60*1000}
}));

app.use('/', index);
app.use('/user', user);
app.use('/login', login);
app.use('/question', question);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(function (req,res,next) {
    res.locals.session = req.session;
    res.locals.expressValidator = req.expressValidator;
});

module.exports = app;
