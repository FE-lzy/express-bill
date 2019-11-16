var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('主页');
  var myDate = new Date();
  let time = myDate.toLocaleString('chinese', { hour12: false });
  var mytime=myDate.toLocaleTimeString(); //获取当前时间  
    console.log(new Date().toLocaleDateString());
  // console.log(myDate.toLocaleDateString('chinese', { hour12: false }));
  // console.log(myDate.toLocaleTimeString('chinese', { hour12: false }));
  res.render('index', { title: 'Express' });
});

module.exports = router;
