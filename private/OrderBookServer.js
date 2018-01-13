// orderBookServer.js

/* use these exchanges:
gdax
bitstamp
binance
bitfinex
gemini
bittrex
kraken
*/
require('dotenv').config();

const WebSocket = require('ws');
const ccxt = require('ccxt');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoose = require('mongoose');
const path = require('path');
const Order = require(path.join(process.cwd(), '/models/orders.js'));
const Spread = require(path.join(process.cwd(), '/models/spreads.js'));

let DEBUG = false;

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, {useMongoClient: true})
.then( () => {
  console.log("Mongoose connect OK");
},
err => {
  console.error("Mongoose connect fail");
});

function pruneSpreadHistory() {
  Spread.count({}, function(err, count) {
    if (err) console.error("pruneSpreadHistory db error %s", err)
    else {
      let diff = count - parseInt(process.env.SPREAD_HISTORY_LIMIT);
      if (DEBUG) console.log("pruneSpreadHistory diff %s", diff);
      if (diff > 0) {
        let q = Spread.find().sort({spread: 1}).limit(diff);
        q.exec(function(err, res) {
          if (err) console.error("prune error %s", err)
          else if (DEBUG) console.log(res);
          let ids = [];
          res.forEach(function(doc) {
            ids.push(doc._id);
          })
          Spread.remove({ _id: { $in: ids }}, function(err, res) {
            if (err) console.error("prune error %s", err)
            else if (DEBUG) console.log("prune result %s", JSON.stringify(res.result));
          })
        });
      }
    }
  })
}

async function updateSpreadHistory(book) {
  let exchanges = Object.keys(book);
  let _max = {
    bid : -9e9,
    exch : null,
    qty : 0
  }
  let _min = {
    ask : 9e9,
    exch : null,
    qty : 0
  }

  exchanges.forEach(function(ex) {
    if (book[ex].bids[0][0] > _max.bid) {
      _max.bid = book[ex].bids[0][0];
      _max.exch = ex;
      _max.qty = book[ex].bids[0][1].toFixed(2);
    }
    if (book[ex].asks[0][0] < _min.ask) {
      _min.ask = book[ex].asks[0][0];
      _min.exch = ex;
      _min.qty = book[ex].asks[0][1].toFixed(2);;
    }
  })
  let spread = (_min.ask / _max.bid).toFixed(3);
  let nowStamp = new Date().toJSON().toString().replace('T', ' ').replace(/....Z/, ' UTC');
  if (DEBUG) console.log("spread %s max %s min %s -- %s",
    spread,
    JSON.stringify(_max),
    JSON.stringify(_min),
    nowStamp

  );

  let _S = {
    max : _max,
    min : _min,
    spread : spread,
    date : nowStamp
  }
  let S = new Spread(_S);
  S.save(function(err, res) {
    if (err) console.error("DB save spread fail %s", err);
    else if (DEBUG) console.log(res);
    pruneSpreadHistory();
  });
}

function truncateBook(book, size) {
  let newbook = {};
  ['asks', 'bids'].forEach(function(side) {
    newbook[side] = book[side].slice(0,size);
  });
  return newbook;
}
/*
async function populateOrderBook(book, api) {
  book = await api.fetchOrderBook('BTC/USD', {
    'limit_bids': 20,
    'limit_asks': 20,
  });
  truncateBook(book, 20);
}
*/
async function getorderbooks(api) {
  let exchanges = Object.keys(api);
  let obs = {};
  const promises = exchanges.map(function(ex) {
    return api[ex].fetchOrderBook('BTC/USD', {
      'limit_bids': 20,
      'limit_asks': 20,
    })
    .then(function(book) {
      obs[ex] = truncateBook(book, 20);
      if (DEBUG) console.log(Object.keys(obs).length.toString() + ' ' + ex);
    });
  });

  await Promise.all(promises);
  updateSpreadHistory(obs);
  return obs;
}

var GetOrderBooks = function(truncate=null) {
  this.truncate = parseInt(truncate);

  this.api = {
    gdax :      new ccxt.gdax(),
    bitstamp :  new ccxt.bitstamp(),
    //binance :   new ccxt.binance(),  //NO BTC/USD
    bitfinex :  new ccxt.bitfinex(),
    gemini :    new ccxt.gemini(),
    //bittrex :   new ccxt.bittrex(),  //NO BTC/USD
    //kraken :    new ccxt.kraken() //service unavailable?
  }

  this.exchanges = Object.keys(this.api);
}

GetOrderBooks.prototype.getbooks = function(cb) {
  getorderbooks(this.api)
  .then( (res) => {
    //console.log("getbooks ok %s", res);
    cb(res);
  })
};

var OrderBookServer = function(truncate=null, port=10101) {
  this.truncate = parseInt(truncate);
  this.port = parseInt(port);
  this.wss = new WebSocket.Server({ port: this.port });
  this.gob = new GetOrderBooks(this.truncate);
  this.broadcastInterval = 3000;
};

OrderBookServer.prototype.broadcastOrderBooks = function() {
  var that = this;

  function broadcast(err, msg) {
    if (err) console.error(err);
    else {
      //console.log(msg.id);
      that.wss.clients.forEach(function(client) {
        client.send(JSON.stringify(msg), function(err) {
          if (err) console.error(err);
        });
      })
    }
  }

  setInterval(function() {
    //console.log()
    that.gob.getbooks(function(res) {
      aggregateBook(res);
      broadcast(null, res);
    });
  }, this.broadcastInterval);
};


function aggregateOrders(orders) {
  //console.log("aggregateOrders %s", JSON.stringify(orders));
  orders.reduce(function(acc, val, idx, arr) {
    arr[idx] = [val[0], acc + val[1]];
    return acc + val[1];
  }, 0);
}

function aggregateBook(book) {
  Object.keys(book).forEach(function(ex) {
    ['bids', 'asks'].forEach(function(side) {
      aggregateOrders(book[ex][side]);
    })
  })
}


module.exports = OrderBookServer;
