require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const Gdax = require('gdax');
const OrderBookServer = require('./private/OrderBookServer.js');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/angular', express.static(process.cwd() + '/node_modules/angular'));
app.use('/bootstrap', express.static(process.cwd() + '/node_modules/bootstrap/dist/css'));
app.use('/angular-ws', express.static(process.cwd() + '/node_modules/angular-websocket/dist'));
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

module.exports = app;

var obs = new OrderBookServer(truncate=10);
console.log("obs on port %s", obs.port);

obs.broadcastOrderBooks();
/*
obs.getBitstampOrderBook(function(err, res) {
  if (err) throw err;
  else {
    console.log("BITSTAMP");
    console.log(res);
  }
})
obs.getGdaxOrderBook(function(err, res) {
  if (err) throw err;
  else {
    console.log("GDAX");
    console.log(res);
  }
})
obs.getBitfinexOrderBook(function(err, res) {
  if (err) throw err;
  else {
    console.log("BITFINEX");
    console.log(res);
  }
})
*/

//const websocket = new Gdax.WebsocketClient(['BTC-USD']);

/*
const websocket = new Gdax.WebsocketClient(
  ['BTC-USD'],
  'https://api-public.sandbox.gdax.com',
  {
    key: process.env.GDAX_KEY,
    secret: process.env.GDAX_SEKRET,
    passphrase: process.env.GDAX_PASSPHRASE,
  },
  { heartbeat: true }
);
*/
/*
websocket.on('message', data => {
  if (data.type === 'done' && data.reason === 'filled')
    console.log("gdax %s", JSON.stringify(data));
});
websocket.on('error', err => {
  console.error(err);
});
websocket.on('close', () => {
  console.log("gdax websocket closed");
});
*/
