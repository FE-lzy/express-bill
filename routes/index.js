var express = require('express');
var router = express.Router();
var fs = require('fs'); // 引入fs模块
// const {accessToken}  = require('../controller/ls1')
/* GET home page. */
router.get('/', function (req, res, next) {
  console.log('主页');
  var myDate = new Date();
  // console.log(access_token())
  let time = myDate.toLocaleString('chinese', { hour12: false });
  var mytime = myDate.toLocaleTimeString(); //获取当前时间  
  console.log(new Date().toLocaleDateString());
  // console.log(myDate.toLocaleDateString('chinese', { hour12: false }));
  // console.log(myDate.toLocaleTimeString('chinese', { hour12: false }));
  res.render('index', { title: 'Express' });
});
router.get('/test', function (req, res, next) {
  // accessToken().then(result=>{
  //   return res.json(result)
  // })
})
module.exports = router;
