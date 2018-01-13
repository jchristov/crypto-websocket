var express = require('express');
var router = express.Router();
const path = require('path');
const Spread = require(path.join(process.cwd(), '/models/spreads.js'));

/* GET users listing. */
router.get('/getSpreadHistory', function(req, res, next) {
  let q = Spread.find().sort({spread: -1});
  var thisres = res;
  q.exec(function(err, res) {
    if (err) {
      console.error("/getSpreadHistory error %s", err);
      thisres.send({error: err});
    }
    else thisres.send({error: null, result: res});
  });
});

module.exports = router;
