var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var OrderSchema = new Schema({
    price: { type: Number, required: true},
    qty: { type: Number, required: true},
    side: { type: String, required: true },
});


module.exports = mongoose.model('Order', OrderSchema);
