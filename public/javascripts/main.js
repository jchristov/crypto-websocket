// main.js

(function(){
    var ws = new WebSocket('ws://localhost:10101');
    /*
    var gdaxDom = document.getElementById('gdax-orderbook');
    var bitstampDom = document.getElementById('bitstamp-orderbook');
    var bitfinexDom = document.getElementById('bitfinex-orderbook');
    */
    ws.onopen = function() {
      // Web Socket is connected, send data using send()
      //ws.send("Message to send");
      console.log("connected");
    };

    ws.onmessage = function(e) {
      var json = JSON.parse(e.data);
      if (json.hasOwnProperty('id')) {

        if (json.id === 'gdax') update(gdaxDom, json);
        else if (json.id === 'bitfinex') update(bitfinexDom, json);
        else if (json.id === 'bitstamp') update(bitstampDom, json);
        else console.log("invalid id %s", json.id);
      } else {
        console.log('no id');
        console.log(json);
      }
      //console.log("%s %s %s", my.ob.gdax.asks.length, my.ob.bitfinex.asks.length, my.ob.bitstamp.asks.length);
    };

    ws.onclose = function(e) {
      console.log("socket closed");
      console.log(e);
    }

    function update(dom, json) {
      while (dom.firstChild) {
        dom.removeChild(dom.firstChild);
      }

      version = document.createElement('p');
      if (json.hasOwnProperty('sequence')) {
        version.innerHTML = json.sequence;
      } else if (json.hasOwnProperty('timestamp')) {
        version.innerHTML = json.timestamp;
      } else {
        version.innerHTML = "no sequence nor timestamp";
      }
      dom.appendChild(version);


      ['bids', 'asks'].forEach(function(val) {
        div = document.createElement('div');
        title = document.createElement('p');
        title.innerHTML = val;
        list = genList(json.bids);
        div.appendChild(title);
        div.appendChild(list);
        dom.appendChild(div);
      })



    }

    function genList(L) {
      ul = document.createElement('ul');
      L.forEach(function(val,idx,arr) {
        li = document.createElement('li');
        li.innerHTML = JSON.stringify(val);
        ul.appendChild(li);
      })
      return ul;
    }
/*
    setInterval(function() {
      console.log("setInterval test");
      my.count++;
      $scope.count++;
      $scope.$apply();
    }, 1111);
*/

})();
