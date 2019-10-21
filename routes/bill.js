var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var request = require('request')
var https = require("https");

const post_data = {
    appKey: 'd0a84cb2b65e42478a0f8b9cec178dd0',
    appSecret: 'bc7fb0fa-5670-402c-99e6-26e89abb368c'
}
const urlApi = 'https://open.leshui365.com';
router.get('/', function (req, res, next) {
    console.log('123');
});
router.get('/getToken', function (req, res, next) {
    console.log(req.body);

    var contents = querystring.stringify(post_data);
    var url = urlApi + '/getToken?' + contents;

    request(url, function (error, response, body) {
        console.log(response.statusCode);
        console.log(body.token);
        let result = {}
        if (!error && response.statusCode == 200) {
            access_token = JSON.parse(body).token;
             result = {code: 20000, data: { token: access_token } }
        } else {
            result = {code: -1, msg:'获取失败' }
        }
        return res.send(result);
    });
    
});
router.post('/queryBillByScan', function (req, res, next) {
    console.log(req.body);
    request({
        url: urlApi + '/api/invoiceInfoByQRCode',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: req.body
    }, function (error, response, body) {
        console.log(body);
        return res.send(body)
    });
   
});

router.post('/queryBill', function (req, res, next) {
    console.log(req.body);
    request({
        url: urlApi + '/api/invoiceInfoForCom',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: req.body
    }, function (error, response, body) {
        console.log(body);
        return res.send(body)
    });
   
});

// jwt获取token
// var connect = { username: req.body.username };// 要生成token的主题信息
// let secretOrPrivateKey = "jwt";// 这是加密的key（密钥）
// let token = jwt.sign(connect, secretOrPrivateKey, {
//     expiresIn: 60 * 60 * 3  //三个小时失效
// })
// console.log(token);
// 保存列表
module.exports = router;
