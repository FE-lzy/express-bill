var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var logger = require('morgan');
var ejs = require('ejs');
var indexRouter = require('./routes/index');
var billRouter = require('./routes/bill');
var userRouter = require('./routes/user')
var manRouter = require('./routes/manager')
const expressJwt = require('express-jwt');
var vertoken = require('./controller/user.js');
const jwt = require('jsonwebtoken');
var app = express();
app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
    res.sendStatus(200);  //让options尝试请求快速结束
  else
    next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
app.engine('html', ejs.__express);
app.set('view engine', 'html');
// 日志
const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  app.use(logger('dev'));
} else {
  // 文件写入流
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeSteam = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(logger('combined', {
    stream: writeSteam
  }))
}
var signkey = 'mes_qdhd_mobile_xhykjyxgs';
// 解析token获取用户信息
app.use(function(req, res, next) {
  var token = req.headers['authorization'];
  console.log('获取到的：',token);
	if(token == undefined){
		return next();
	}else{
    console.log(jwt);
    
    // console.log(info);

		vertoken.verToken(token).then((data)=> {
      console.log('123',token);
			req.data = data;
			return next();
		}).catch((error)=>{
      console.log(error);
			return next();
		})
	}
});

//验证token是否过期并规定哪些路由不用验证
app.use(expressJwt({
  secret: 'mes_qdhd_mobile_xhykjyxgs'
}).unless({
  path: ['/', '/user/login']//除了这个地址，其他的URL都需要验证
}));
console.log("object");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/bill', billRouter);
app.use('/manager', manRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    console.error(req.path + ',无效token');
    res.json({
      message: 'token过期，请重新登录',
      code: 400
    })
    return
  }
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
