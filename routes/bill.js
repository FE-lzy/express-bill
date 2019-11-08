var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var request = require('request')
var https = require("https");
const { getBillDetail, BillIsHave, queryScanString, queryScanByCode, saveMainBill, saveMainBillByScan, saveBillDetail } = require('../controller/ls')
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
    // console.log(req.body);
    const data = {
        resultMsg: '查验结果成功',
        invoiceName: '山东增值税（卷式普通发票）',
        isFree: 'N',
        RtnCode: '00',
        resultCode: '1000',
        invoiceResult:
            '{"invoiceTypeName":"山东增值税（卷式普通发票）","invoiceTypeCode":"11","checkDate":"2019-11-04 11:36:24","checkNum":"1","invoiceDataCode":"037001851107","invoiceNumber":"01947559","machineNumber":"01947559","billingTime":"2019-10-04","purchaserName":"日照日科信息技术有限公司","taxpayerNumber":"91371102MA3C7J0X37","taxDiskCode":"661718079692","salesName":"中国石化销售有限公司山东日照石油分公司","salesTaxpayerNum":"91371100724291958M","salesTaxpayerAddress":" ","salesTaxpayerBankAccount":" ","totalAmount":"221.24","totalTaxNum":"28.76","totalTaxSum":"250.00","invoiceRemarks":" ","goodsClerk":"刘芳","checkCode":"85180770102055250185","voidMark":"0","isBillMark":"N","invoiceDetailData":[{"lineNum":"1","goodserviceName":"*汽油*92号车用汽油(Ⅵ)","model":" ","unit":" ","number":"37.2100000","price":"6.7200000","sum":"250.00","taxRate":" ","tax":" ","isBillLine":"N","zeroTaxRateSign":"","zeroTaxRateSignName":""}],"tollSign":"","tollSignName":""}'
    }
    if (data) {
        if (data.resultCode == '1000') {
            // 加日志
            let resDetail = JSON.parse(data.invoiceResult);
            saveMainBill(resDetail).then(result => {
                if (result) {
                    res.json(
                        new SuccessModel(data)
                    )
                }
            })
        } else {
            res.json(
                new ErrorModel('没有查询到票的信息')
            )
        }


    }



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
            res.json(
                new ErrorModel('记录已存在，请勿重复录入')
            )
            return
        }

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
                    new ErrorModel(err)
                });
            }
        }).catch(err => {
            new ErrorModel(err)
        });


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
