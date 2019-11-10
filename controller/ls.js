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
                reslove(body)
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
// 查询是否存在
const BillIsHave = (data) => {
    console.log(data);
    const sql = `
        select * from fp_main where invoiceDataCode = '${data.code}'
    `
    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}
// 修改
// const BillIsHave = (data) => {
//     console.log(data);
//     const sql = `
//         update * from fp_main where invoiceDataCode = '${data.code}'
//     `
//     return exec(sql).then(rows => {
//         return rows[0] || {}
//     })
// }
// 查询具体信息
const getBillDetail = (data) => {
    const sql = `
        select * from fp_detail where fp_id = '${data.id}'
    `
    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}
// 存储数据
const saveMainBill = (data) => {

    const sql = `
        insert  into fp_main (invoiceTypeCode,checkDate,checkNum,invoiceDataCode,invoiceTypeName
            invoiceNumber,billingTime,taxDiskCode) 
        values 
        ('${data.invoiceTypeCode}','${data.checkDate}','${data.checkNum}','${data.invoiceDataCode}','${data.invoiceTypeName}','${data.invoiceNumber}',
        '${data.billingTime}','${data.taxDiskCode}',)
    `

    return exec(sql).then(rows => {
        return rows;
    })
}

const saveMainBillByScan = (data) => {
    // 获取当前时间
    let entryDate = new Date().toLocaleString();
    const sql = `
        insert  into fp_main 
        (invoiceTypeCode,invoiceTypeName,checkDate,checkNum,invoiceDataCode,invoiceNumber,billingTime,taxDiskCode,fp_checktype,fp_czy,fp_gsr,fp_gsbm,fp_gsdw,fp_bz,entryDate) 
        values ('${data.invoiceTypeCode}','${data.invoiceTypeName}','${data.checkDate}','${data.checkNum}','${data.invoiceDataCode}','${data.invoiceNumber}',
        '${data.billingTime}','${data.taxDiskCode}','${data.fp_checktype}','${data.fp_czy}',
        '${data.fp_gsr}','${data.fp_gsbm}','${data.fp_gsdw}','${data.fp_bz}','${entryDate}')
    `
    console.log(sql);

    return exec(sql).then(rows => {
        return rows;
    })
}
// 修改发票信息
const updateMainBill = (id,data) =>{
    console.log(data);
    const sql= `
        update fp_main set fp_gsr =  '${data.fp_gsr}' ,fp_gsbm = '${data.fp_gsbm}',fp_bz = '${data.fp_bz}'
        where id = '${id}'
    `
    console.log(sql);

    return exec(sql).then(rows => {
        return rows;
    })
}

const saveBillDetail = (id, data) => {
    console.log(data);
    const sql = `
        insert  into fp_detail 
        (fp_id,fp_detail) 
        values ('${id}','${data}')
    `
    console.log(sql);

    return exec(sql).then(rows => {
        return rows;
    })
}


module.exports = {
    getLsToken,
    queryScanString,
    queryScanByCode,
    saveMainBillByScan,
    saveBillDetail,
    BillIsHave,
    getBillDetail,
    updateMainBill
}