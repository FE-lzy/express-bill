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
                if(!body.isFree){
                    // 不免費
                    queryLog(param.dwbm).then(insertId =>{
                        console.log(insertId);
                    })
                }
                reslove(body)
            } else {
                reject(error)
            }
        });
    });
    return promise
}
const queryLog = (data) => {
    return true
}
// 查询是否存在
const BillIsHave = (data) => {
    console.log(data);
    const sql = `
        select * from fp_main where invoiceNumber = '${data.code}'
    `
    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}
const getBillType = (data) => {
    const sql = `
        select * from fp_type where 1=1
    `
    return exec(sql).then(rows => {
        return rows || {}
    })

}
// 查询发票列表
const getBillList = (data) => {

    var sql = `
        select m.id,m.invoiceDataCode,m.invoiceTypeCode,m.saleName,m.totalTaxSum,m.entryDate,
        z.zymc,b.bmmc,t.type_name from fp_main as m 
        inner join fp_detail as d on m.id = d.fp_id 
        inner join pub_zyxx as z on z.id = m.fp_gsr
        inner join pub_bmxx as b on b.id = m.fp_gsbm
        inner join fp_type  as t on m.invoiceTypeCode = t.type_id
        where fp_gsdw = '${data.dwbm}'
    `
    if (data.invoiceDataCode) {
        sql += ` and m.invoiceDataCode = '${data.invoiceDataCode}'`
    }
    if (data.invoiceNumber) {
        sql += ` and m.invoiceNumber = '${data.invoiceNumber}'`
    }
    if (data.saleName) {
        sql += ` and m.saleName like '%${data.saleName}%'`
    }
    if (data.invoiceTypeCode) {
        sql += ` and m.invoiceTypeCode = '${data.invoiceTypeCode}'`
    }
    if (data.fp_gsbm) {
        sql += ` and m.fp_gsbm = '${data.fp_gsbm}'`
    }
    if (data.billingTime) {
        sql += ` and m.billingTime >'${data.billingTime[0]}' and m.billingTime < '${data.billingTime[1]}'`
    }
    if (data.entryDate) {
        sql += ` and m.entryDate >'${data.entryDate[0]}' and m.entryDate < '${data.entryDate[1]}'`
    }
    if (data.minPrice) {
        sql += ` and m.totalTaxSum >'${data.minPrice}'`
    }
    if (data.maxPrice) {
        sql += ` and m.totalTaxSum < '${data.maxPrice}'`
    }

    return exec(sql).then(rows => {
        return rows || {}
    })
}
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
            invoiceNumber,billingTime,taxDiskCode,salesName,totalTaxSum) 
        values 
        ('${data.invoiceTypeCode}','${data.checkDate}','${data.checkNum}','${data.invoiceDataCode}','${data.invoiceTypeName}','${data.invoiceNumber}',
        '${data.billingTime}','${data.taxDiskCode}','${data.salesName}','${data.totalTaxSum}')
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
const updateMainBill = (id, data) => {
    console.log(data);
    const sql = `
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
    updateMainBill,
    getBillList,
    getBillType
}