import React, { Component } from 'react';
import './History.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js'

class Rows extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
    }
    this.getData = this.getData.bind(this);
  }

  getData() {
    fetch('/api/getSpreadHistory')
    .then(r => r.json())
    .then(json => {
      //console.log(json);
      if (json.error) {
        console.log("getSpreadHistory error %s", json.error);
      } else {
        //return JSON.stringify(json.result);
        this.setState({data: json.result});
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    this.getData();
  }

  render() {
    let data = [];
    if (this.state.data) {
      this.state.data.forEach(function(x, idx) {
        data.push(
          <tr key={idx}>
            <td>{x.spread}</td>
            <td>{x.max.exch}</td>
            <td>{x.max.bid}</td>
            <td>{x.max.qty}</td>
            <td>{x.min.exch}</td>
            <td>{x.min.ask}</td>
            <td>{x.min.qty}</td>
            <td>{x.date}</td>
          </tr>
        );
      });
    }
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>spread</th>
              <th>max bid exch</th>
              <th>max bid</th>
              <th>bid qty</th>
              <th>min ask exch</th>
              <th>min ask</th>
              <th>ask qty</th>
              <th>date</th>
            </tr>
          </thead>
          <tbody>
            {data}
          </tbody>
        </table>
      </div>
    );
  }

}

class History extends Component {
  render() {
    let nowStamp = new Date().toJSON().toString()
    return (
      <div className="hist-div">
        History as of: {nowStamp}
        <Rows />
      </div>
    )
  }

}

export default History;
