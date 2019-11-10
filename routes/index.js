var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('主页');
  var myDate = new Date();
  let time = myDate.toLocaleString();
  console.log(time);
  res.render('index', { title: 'Express' });
});

module.exports = router;
