require('dotenv').config();  // add .env to process.env
const Gdax = require('gdax')
var fetch = require('node-fetch');


/*
Website
https://public.sandbox.gdax.com

REST API
https://api-public.sandbox.gdax.com

Websocket Feed
wss://ws-feed-public.sandbox.gdax.com
*/

const gdaxHost = 'https://api-public.sandbox.gdax.com';

const publicClient = new Gdax.PublicClient();

publicClient
  .getProductOrderBook({ level: 2 }, function(err, resp, book) {
  if (err) throw err;
  //console.log("RESP");
  //console.log(resp);
  console.log("GDAX");
  console.log(book);
})


const BFX = require('bitfinex-api-node')
const opts = {
  version: 1,
  //transform: true
}

const bfxRest = new BFX(process.env.BITFINEX_KEY, process.env.BITFINEX_SEKRET, opts).rest
bfxRest.orderbook('BTCUSD', (err, res) => {
  if (err) throw err;
  console.log('BITFINEX');
  console.log(res)
})


const bitstampOrderBook = 'https://www.bitstamp.net/api/v2/order_book/btcusd'
fetch(bitstampOrderBook)
.then(function(res) {
  if (res.ok) return res.json();
  else return false;
})
.then(function(json) {
  if (!json) console.err("could not get bitstamp orderbook");
  else {
    console.log("BITSTAMP");
    console.log(json);
  }
})
