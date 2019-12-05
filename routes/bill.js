var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var request = require('request')
var https = require("https");
const { getLsToken, deleteBills, getAllBillData, getBillType, getBillListTotal, getBillDetail, BillIsHave, queryScanString, queryScanByCode, saveMainBill, updateMainBill, saveMainBillByScan, saveBillDetail, getBillList } = require('../controller/ls')
const { getDwxx } = require('../controller/manager')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const urlApi = 'https://open.leshui365.com';

router.get('/', function (req, res, next) {
    return 123;
});

// 根据二维码字符串查验
router.post('/queryBillByScan', function (req, res, next) {
    console.log(req.body);

    if (!req.body) {
        return res.json(
            new ErrorModel('参数缺失')
        )
    }

    queryScanString(req.body).then(data => {
        // console.log(data);
        console.log('byScan',data);
        if (!data.error) {
            if (data.resultCode == '1000') {
                if (data) {
                    return res.json(
                        new SuccessModel(data)
                    )
                }
            } else {
                return res.json(
                    new ErrorModel(data.resultMsg)
                )
            }
        } else {
            console.error(req.path + data.error);
            return res.json(
                new ErrorModel(data.error)
            )
        }

    }).catch(err => {
        return res.json(
            new ErrorModel(err)
        )
    })
});
router.post('/getToken', function (req, res, next) {
    getLsToken().then(lsToken => {
        console.log(lsToken);
        if (lsToken) {
            return res.json(
                new SuccessModel(lsToken)
            )
        } else {
            return res.json(
                new ErrorModel('获取token错误')
            )
        }
    }).catch(err => {
        return res.json(
            new ErrorModel(err)
        )
    })
})
// 根据发票代码和发票号码查询
router.post('/queryBillByCode', function (req, res, next) {
    queryScanByCode(req.body).then(data => {
        if (!data.error) {
            if (data.resultCode == '1000') {
                // 加日志
                return res.json(
                    new SuccessModel(data)
                )

            } else {
                return res.json(
                    new ErrorModel(data.resultMsg)
                )
            }
        } else {
            console.error(req.path + data.error);
            return res.json(
                new ErrorModel(data.error)
            )
        }
    }).catch(err => {
        console.error(req.path + ' ' + err);
        return res.json(
            new ErrorModel(err)
        )
    });

});
router.post('/deleteBills', function (req, res, next) {
    deleteBills(req.body).then(result => {
        console.log(result);
        if (result.affectedRows) {
            return res.json(
                new SuccessModel(result)
            )
        } else {
            return res.json(
                new ErrorModel('删除失败')
            )
        }

    }).catch(err => {
        console.error(req.path + ' ' + err);
        return res.json(
            new ErrorModel(err)
        )
    })
})
router.post('/updateMainBill', function (req, res, next) {
    updateMainBill(req.body.id, req.body).then(updateRow => {
        if (updateRow.affectedRows) {
            res.json(
                new SuccessModel(updateRow.affectedRows)
            )
        } else {
            res.json(
                new ErrorModel('重复数据')
            )
        }
    }).catch(err => {
        console.error(req.path + ' ' + err);
        res.json(
            new ErrorModel(err)
        )
    });
})
router.post('/saveBill', function (req, res, next) {
    console.log(req.body);
    let info = req.body;
    //存储发票基本信息
    let billInfo = JSON.parse(info.billInfo);
    console.log('billInfo ---', billInfo);
    //存储基本信息
    billInfo.fp_checktype = 'ByQRCode';
    billInfo.fp_czy = info.uid;
    billInfo.fp_gsdw = info.dwbm;
    billInfo.fp_gsr = info.fp_gsr;
    billInfo.fp_gsbm = info.fp_gsbm;
    billInfo.fp_bz = info.fp_bz;
    billInfo.uid = info.uid;
    BillIsHave({ code: billInfo.invoiceDataCode, number: billInfo.invoiceNumber }).then(fpInfo => {
        if (fpInfo.id) {
            // 更新操作
            updateMainBill(fpInfo.id, billInfo).then(updateRow => {
                if (updateRow.affectedRows) {
                    res.json(
                        new SuccessModel(updateRow.affectedRows)
                    )
                } else {
                    res.json(
                        new ErrorModel('重复数据')
                    )
                }
            }).catch(err => {
                console.error(req.path + ' ' + err);
                res.json(
                    new ErrorModel(err)
                )
            });

        } else {
            getDwxx({ dwbm: billInfo.fp_gsdw }).then(checkData => {
                console.log('------------------------', checkData, billInfo);

                if (checkData.check_dwmc == 1 && checkData.dwmc !== billInfo.purchaserName) {
                    console.log(checkData.dwmc, billInfo.purchaserName);
                    // 验证发票抬头
                    return res.json(
                        new ErrorModel('发票抬头与公司名称不一致')
                    )
                }
                if (checkData.check_taxnum == 1 && checkData.taxnum !== billInfo.taxpayerNumber) {
                    // 验证发票抬头
                    return res.json(
                        new ErrorModel('纳税人识别号与公司纳税人识别号不一致')
                    )
                }
                console.log(checkData);
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
                            console.error(req.path + ' ' + err);
                            res.json(
                                new ErrorModel(err)
                            )
                        });
                    }
                }).catch(err => {
                    console.error(req.path + ' ' + err);
                    res.json(
                        new ErrorModel(err)
                    )
                });

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
    }).catch(err => {
        console.error(req.path + ' ' + err);
    });

});

// 验证是否存在
router.post('/getBillInfo', function (req, res, next) {
    console.log('请求', req.body);
    if (!req.body || !req.body.code || !req.body.number) {
        return res.json(
            new ErrorModel('二维码内容不全，请使用票面参数查询')
        )
    }
    BillIsHave(req.body).then(fpInfo => {
        console.log('是否存在', fpInfo);
        if (fpInfo.id) {
            getBillDetail(fpInfo).then(info => {
                console.log(info);
                fpInfo.fp_detail = info;
                console.log(fpInfo);
                return res.json(
                    new SuccessModel(fpInfo)
                )
            }).catch(err => {
                console.error(req.path + ' ' + err);
                return res.json(
                    new ErrorModel(err)
                )
            })
        } else {
            console.error(req.path + ' 不存在');
            return res.json(
                new ErrorModel('不存在')
            )
        }
    }).catch(err => {
        console.error(req.path + ' ' + err);
        return res.json(
            new ErrorModel(err)
        )
    })
});
// 查询发票列表
router.post('/getBillList', function (req, res, next) {
    if (req.body.dwbm) {
        getBillListTotal(req.body).then(totalData => {     //获取总数
            console.log(1111, totalData.total);
            if (totalData.total > 0) {
                getAllBillData(req.body).then(allData => {   //获取总的数据
                    console.log('--------all',allData);
                    getBillList(req.body).then(data => {     //分页显示数据
                        console.log(data);
                        result = Object.assign({ data: data }, totalData,{allData:allData})
                        console.log(result);
                        return res.json(
                            new SuccessModel(result)
                        )
                    }).catch(err => {
                        console.error(req.path + ' ' + err);
                        return res.json(
                            new ErrorModel(err)
                        )
                    })
                }).catch(err => {
                    console.error(err);
                    return res.json(
                        new ErrorModel(err)
                    )
                })


            } else {
                return res.json(
                    new SuccessModel([])
                )
            }

        }).catch(err => {
            console.error(req.path + ' ' + err);
            return res.json(
                new ErrorModel(err)
            )
        })

    } else {
        console.error(req.path + ' 参数缺失');
        return res.json(
            new ErrorModel('参数缺失')
        )
    }

});
router.post('/getBillType', function (req, res, next) {
    getBillType().then(data => {
        return res.json(
            new SuccessModel(data)
        )
    }).catch(err => {
        console.error(req.path + ' ' + err);
        return res.json(
            new ErrorModel(err)
        )
    })


});

// 保存列表
module.exports = router;
