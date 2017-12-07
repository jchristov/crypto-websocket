// orderBookServer.js

const WebSocket = require('ws');
const fetch = require('node-fetch');
const BFX = require('bitfinex-api-node');
const Gdax = require('gdax');

var GetOrderBooks = function(truncate=null) {
  this.truncate = parseInt(truncate);

  /* all apis allow at least 1s GET rate */

  //bitstamp uses public api, no fancy stuff
  this.bitstampOrderBook =
    'https://www.bitstamp.net/api/v2/order_book/btcusd';

  //gdax has node module, fancy
  this.gdaxPublicClient = new Gdax.PublicClient();

  //bitfinex also has node module, needs auth? so fancy
  this.bfxRest = new BFX(
    process.env.BITFINEX_KEY,
    process.env.BITFINEX_SEKRET,
    {
      version: 1,
      //transform: true
    }).rest
}


GetOrderBooks.prototype.getBitstamp = function(cb) {
  fetch(this.bitstampOrderBook)
  .then(function(res) {
    if (res.ok) return res.json();
    else cb('fetch_error');
  })
  .then(function(json) {
    if (!json) {
      console.err("could not get bitstamp orderbook");
      cb('json_error');
    }
    else {
      //console.log("BITSTAMP");
      //console.log(json);
      json.id = 'bitstamp';
      if (this.truncate) {
        //console.log('truncate %s', this.truncate);
        json.bids = json.bids.slice(0, this.truncate);
        json.asks = json.bids.slice(0, this.truncate);
      } else {
        console.log('no truncate');
      }
      cb(null, json);
    }
  })
};

GetOrderBooks.prototype.getGdax = function(cb) {
  this.gdaxPublicClient
    .getProductOrderBook({ level: 2 }, function(err, resp, book) {
    if (err) cb(err);
    if (!resp) cb('gdax_bad_response');
    else {
      book.id = 'gdax';

      if (this.truncate) {
        //console.log('truncate %s', this.truncate);
        book.bids = book.bids.slice(0, this.truncate);
        book.asks = book.bids.slice(0, this.truncate);
      }

      cb(null, book);
    }
    //console.log("RESP");
    //console.log(resp);
    //console.log("GDAX");
    //console.log(book);
  })
};

GetOrderBooks.prototype.getBitfinex = function(cb) {
  this.bfxRest.orderbook('BTCUSD', (err, res) => {
    if (err) cb(err);
    else {
      res.id = 'bitfinex';
      if (this.truncate) {
        //console.log('truncate %s', this.truncate);
        res.bids = res.bids.slice(0, this.truncate);
        res.asks = res.bids.slice(0, this.truncate);
      }

      /* 2017-12-06 ttlee
      res.bids and res.asks are arrays of obj
      transform into array of arrays like gdax and bitstamp
      */
      res.timestamp = res.bids[0].timestamp;
      ['bids', 'asks'].forEach(function(type) {
        res[type].forEach(function(val, idx, arr) {
          arr[idx] = [val.price, val.amount];
        })
      })


      cb(null, res);
    }
    //console.log('BITFINEX');
    //console.log(res)
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
    if (err) client.send({error: err});
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
    that.gob.getBitstamp(broadcast);
    that.gob.getGdax(broadcast);
    that.gob.getBitfinex(broadcast);
  }, this.broadcastInterval);

};

module.exports = OrderBookServer;
