const { post_data, urlApi, postQueryParam } = require('../conf/ls')
var querystring = require('querystring');
var request = require('request')
const { exec, escape } = require('../db/mysql')
// 请求token
function getLsToken() {
    let contens = querystring.stringify(post_data); // 转换json
    let url = urlApi + '/getToken?' + contens;
    // get请求获取token
    var promise = new Promise(function (reslove, reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let access_token = JSON.parse(body).token;
                reslove(access_token)
            } else {
                reject(error)
            }
        });
    });
    return promise
}

// 验证扫描字符串
function queryScanString(param) {
    // get请求获取token
    var promise = new Promise(function (reslove, reject) {
        request(postQueryParam('/api/invoiceInfoByQRCode', param), function (error, response, body) {

            if (!error && response.statusCode == 200) {
                let result = JSON.parse(body);
                reslove(result)
            } else {
                reject(error)
            }
        });
    });
    return promise
}
// 根据发票代码和号码查验
function queryScanByCode(param) {
    // get请求获取token
    var promise = new Promise(function (reslove, reject) {
        request(postQueryParam('/api/invoiceInfoForCom', param), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                reslove(body)
            } else {
                reject(error)
            }
        });
    });
    return promise
}
// 存储数据
const saveMainBill = (data) => {

    const sql = `
        insert  into fp_main (invoiceTypeCode,checkDate,checkNum,invoiceDataCode,invoiceNumber,billingTime,taxDiskCode) 
        values 
        ('${data.invoiceTypeCode}','${data.checkDate}','${data.checkNum}','${data.invoiceDataCode}','${data.invoiceNumber}','${data.billingTime}','${data.taxDiskCode}')
    `   
    console.log(sql);

    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}

module.exports = {
    getLsToken,
    queryScanString,
    queryScanByCode,
    saveMainBill
}