var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var request = require('request')
var https = require("https");
const { getBillDetail, BillIsHave, queryScanString, queryScanByCode, saveMainBill, updateMainBill, saveMainBillByScan, saveBillDetail } = require('../controller/ls')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const urlApi = 'https://open.leshui365.com';

router.get('/', function (req, res, next) {
    return 123;
});

// 根据二维码字符串查验
router.post('/queryBillByScan', function (req, res, next) {
    console.log(req.body);

    if (!req.body) {
        res.json(
            new ErrorModel('参数缺失')
        )
    }
    queryScanString(req.body).then(data => {
        // console.log(data);
        if (data) {
            res.json(
                new SuccessModel(data)
            )
        }

    }).catch(err => {
        res.json(
            new ErrorModel(err)
        )
    })
});

// 根据发票代码和发票号码查询
router.post('/queryBillByCode', function (req, res, next) {
    queryScanByCode(req.body).then(data => {
        if (data) {
            if (data.resultCode == '1000') {
                // 加日志
                if (data) {
                    res.json(
                        new SuccessModel(data)
                    )
                }
            } else {
                res.json(
                    new ErrorModel('没有查询到票的信息')
                )
            }
        }
    });

});
router.post('/saveBill', function (req, res, next) {
    console.log(req.body);
    let info = req.body;
    //存储发票基本信息
    let billInfo = JSON.parse(info.billInfo);
    //存储基本信息
    billInfo.fp_checktype = 'ByQRCode';
    billInfo.fp_czy = info.uid;
    billInfo.fp_gsdw = 1;
    billInfo.fp_gsr = info.fp_gsr;
    billInfo.fp_gsbm = info.fp_gsbm;
    billInfo.fp_bz = info.fp_bz;

    BillIsHave({ code: billInfo.invoiceDataCode }).then(fpInfo => {
        if (fpInfo.id) {
            // 更新操作
            updateMainBill(fpInfo.id,billInfo).then(updateRow => {
                if (updateRow.affectedRows) {
                    res.json(
                        new SuccessModel(updateRow.affectedRows)
                    )
                } else {
                    res.json(
                        new SuccessModel('重复数据')
                    )
                }
            }).catch(err => {
                res.json(
                    new ErrorModel(err)
                )
            });

        } else {
            saveMainBillByScan(billInfo).then(insertRes => {
                console.log('123：', insertRes);
                if (insertRes.insertId) {
                    saveBillDetail(insertRes.insertId, info.billInfo).then(result => {
                        console.log(result);
                        if (result.insertId) {
                            res.json(
                                new SuccessModel(result.insertId)
                            )
                        }
                    }).catch(err => {
                        res.json(
                            new ErrorModel(err)
                        )
                    });
                }
            }).catch(err => {
                res.json(
                    new ErrorModel(err)
                )
            });
        }
    });


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
            result = { code: 20000, data: { token: access_token } }
        } else {
            result = { code: -1, msg: '获取失败' }
        }
        return res.send(result);
    });

});

// 验证是否存在
router.post('/getBillInfo', function (req, res, next) {
    console.log('请求', req.body);
    BillIsHave(req.body).then(fpInfo => {
        console.log(fpInfo);
        if (fpInfo.id) {
            getBillDetail(fpInfo).then(info => {
                console.log(info);
                fpInfo.fp_detail = info;
                console.log(fpInfo);
                res.json(
                    new SuccessModel(fpInfo)
                )
            }).catch(err => {
                res.json(
                    new ErrorModel(err)
                )
            })
        } else {
            res.json(
                new ErrorModel('不存在')
            )
        }
    }).catch(err => {
        res.json(
            new ErrorModel(err)
        )
    })
});
// router.post('/queryBill', function (req, res, next) {
//     console.log(req.body);
//     request({
//         url: urlApi + '/api/invoiceInfoForCom',
//         method: "POST",
//         json: true,
//         headers: {
//             "content-type": "application/json",
//         },
//         body: req.body
//     }, function (error, response, body) {
//         console.log(body);
//         return res.send(body)
//     });

// });

// jwt获取token
// var connect = { username: req.body.username };// 要生成token的主题信息
// let secretOrPrivateKey = "jwt";// 这是加密的key（密钥）
// let token = jwt.sign(connect, secretOrPrivateKey, {
//     expiresIn: 60 * 60 * 3  //三个小时失效
// })
// console.log(token);
// 保存列表
module.exports = router;
