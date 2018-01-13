var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var SpreadSchema = new Schema({
    max : {
      bid : Number,
      exch : String,
      qty : Number
    },
    min : {
      ask : Number,
      exch : String,
      qty : Number
    },
    spread : Number,
    date : String,
});


module.exports = mongoose.model('Spread', SpreadSchema);
