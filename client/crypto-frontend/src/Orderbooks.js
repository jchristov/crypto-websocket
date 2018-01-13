import React, { Component } from 'react';
//import logo from './logo.svg';
import './Orderbooks.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js'
//const leftPad = require('left-pad')
import History from './History';

class Rows extends Component {

  render() {
    let rows = [];
    this.props.data.forEach(function(row, idx) {
      //let prettyQty = leftPad(row[1].toFixed(2).toString(),5, '_').replace(/_/, ' ');
      let cn = 'fixed-td-width';

      rows.push(
        <tr key={idx}>
          <td>{row[0].toFixed(2)}</td>
          <td className={cn}>{row[1].toFixed(2)}</td>
        </tr>
      );
    })

    return (
      <div>
        <table className="book-data">
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}

class Book extends Component {

  render() {
    //console.log("Book %s", JSON.stringify(this.props));
    let bids = <Rows data={this.props.book.bids} />;
    let asks = <Rows data={this.props.book.asks.slice().reverse()} />;

    return (
      <div>
        <div>
          {asks}
        </div>
        
        <div>
          {bids}
        </div>
      </div>
    )
  }
}
class BookListing extends Component {
  render() {
    let header = [];
    let bidask = [];
    if (this.props.orderbook) {
      var that = this;
      this.props.exchanges.forEach(function(val, idx) {
        header.push(
          <th key={idx}>
          {val}
          </th>
        );
        bidask.push(
          <td key={idx}>
            <Book book={that.props.orderbook[val]} />
          </td>
        );
      });
    }
    return (
      <div className="main-div">
        <table className="main-table">
          <thead>
            <tr>
              {header}
            </tr>
          </thead>
          <tbody>
            <tr>
              {bidask}
            </tr>
          </tbody>
        </table>

        <div className="historical-info">
          <History ob={this.props.orderbook} />
        </div>
      </div>
    )
  }
}

/* Moved to server side

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
*/

class Orderbooks extends Component {
  constructor(props) {
    super(props);
    // main.js

    /*
    var gdaxDom = document.getElementById('gdax-orderbook');
    var bitstampDom = document.getElementById('bitstamp-orderbook');
    var bitfinexDom = document.getElementById('bitfinex-orderbook');
    */
    this.ws = null;
    this.state = {
      orderbook : null,
      exchanges : [],
      socketConnected : false,
    }

    this.startWebSocket = this.startWebSocket.bind(this);
    this.restartWebSocket = this.restartWebSocket.bind(this);

    this.startWebSocket();
  }

  startWebSocket() {
    this.ws = new WebSocket('ws://localhost:10101');
    var that = this;
    this.ws.onopen = function() {
      // Web Socket is connected, send data using send()
      //ws.send("Message to send");
      console.log("connected");
      that.setState({socketConnected : true});
    };


    this.ws.onmessage = function(e) {
      var json = JSON.parse(e.data);
      let exchanges = Object.keys(json);
      exchanges.sort();
      if (that.state.exchanges.length === 0) {
        that.setState({exchanges: exchanges});
      }
      that.setState({orderbook: json});
    };

    this.ws.onclose = function(e) {
      that.setState({socketConnected : false});
      console.log("socket closed");
      console.log(e);
      that.restartWebSocket();
    }
  }

  restartWebSocket() {
    console.log("attempting to restart websocket");
    var that = this;
    setTimeout(function() {
      that.startWebSocket();
      console.log("restarted websocket");
    }, 5000);
  }

  render() {
    let status = this.state.socketConnected ? 'websocket connected' : 'websocket disconnected';
    return (
      <div>
        <div className='header'>
          <ul className='header-ul'>
            <li className='title'>crypto orderbook history</li>
            <li className={this.state.socketConnected ? 'bg-green' : 'bg-red'}>{status}</li>
          </ul>
        </div>
        <div>
          <BookListing
            exchanges={this.state.exchanges}
            orderbook={this.state.orderbook}
            />
        </div>
      </div>
    );
  }
}

export default Orderbooks;
