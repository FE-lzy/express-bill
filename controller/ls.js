const { post_data, urlApi, postQueryParam } = require('../conf/ls')
var querystring = require('querystring');
var request = require('request')
var validTime = '' //当前时间戳
var access_token = '';
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

function accessToken() {
    var promise = new Promise(function (reslove, reject) {
        if (!access_token || validTime < (new Date()).getTime()) {
            getLsToken().then(token => {
                validTime += 60 * 60 * 2;
                access_token = token;
                reslove(access_token)
            }).catch(err => {
                console.error(err);
                reject(err)
            });
        } else {
            reslove(access_token)
        }
    })

    return promise;

}
// 验证扫描字符串
function queryScanString(param) {
    // get请求获取token
    var promise = new Promise(function (reslove, reject) {
        request(postQueryParam('/api/invoiceInfoByQRCode', param), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.error) {
                    reject(body)
                }
                if (body.isFree == 'N') {
                    // 不免費
                    let logParam = Object.assign({ dwbm: param.dwbm }, body);
                    console.log('参数：', logParam);
                    recordLog(logParam).then(insertRes => {
                        if (!insertRes.insertId) {
                            console.error(param.dwbm + '查询发票，保存失败' + logParam)
                        } else {
                            console.log(param.dwbm + '查验发票' + logParam);
                        }
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
function recordLog(data) {
    console.log(data);
    // 获取当前时间
    let entryDate = new Date().toLocaleString('chinese', { hour12: false });
    const sql = `
        insert into fp_record (resultCode,resultMsg,invoiceName,invoiceResult,dwbm,createTime) values 
        ('${data.resultCode}',
        '${data.resultMsg}',
        '${data.invoiceName}',
        '${data.invoiceResult}',
        ${data.dwbm},
        '${entryDate}'
        )
    `
    console.log(sql);
    return exec(sql).then(rows => {
        return rows
    })
}
// 根据发票代码和号码查验
function queryScanByCode(param) {
    console.log(param);
    // get请求获取token
    var promise = new Promise(function (reslove, reject) {
        request(postQueryParam('/api/invoiceInfoForCom', param), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                if (body.error) {
                    reject(body)
                }
                if (body.isFree == 'N') {
                    // 不免費
                    let logParam = Object.assign({ dwbm: param.dwbm }, body);
                    console.log('参数：', logParam);
                    recordLog(logParam).then(insertRes => {
                        if (!insertRes.insertId) {
                            console.error(param.dwbm + '查询发票，保存失败' + logParam)
                        } else {
                            console.log(param.dwbm + '查验发票' + logParam);
                        }
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

// 查询是否存在
const BillIsHave = (data) => {
    console.log(data);
    const sql = `
        select * from fp_main where invoiceDataCode = '${data.code}' and invoiceNumber = ${data.number} and is_delete = 0
    `
    console.log(sql);
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
        select m.id,m.invoiceDataCode,m.invoiceTypeCode,m.salesName,m.totalTaxSum,m.entryDate,
        z.zymc,b.bmmc,t.type_name,d.fp_detail,u.username,m.fp_gsr,m.fp_gsbm from fp_main as m 
        inner join fp_detail as d on m.id = d.fp_id 
        left join pub_zyxx as z on z.id = m.fp_gsr
        inner join pub_bmxx as b on b.id = m.fp_gsbm
        inner join fp_type  as t on m.invoiceTypeCode = t.type_id
        left join pub_user  as u on u.id = m.fp_czy
        where m.fp_gsdw = '${data.dwbm}' and m.is_delete = 0
    `
    if (data.invoiceDataCode) {
        sql += ` and m.invoiceDataCode = '${data.invoiceDataCode}'`
    }
    if (data.invoiceNumber) {
        sql += ` and m.invoiceNumber = '${data.invoiceNumber}'`
    }
    if (data.salesName) {
        sql += ` and m.salesName like '%${data.salesName}%'`
    }
    if (data.invoiceTypeCode) {
        sql += ` and m.invoiceTypeCode = '${data.invoiceTypeCode}'`
    }
    if (data.fp_gsbm) {
        sql += ` and m.fp_gsbm = '${data.fp_gsbm}'`
    }
    if (data.billingTime) {
        var reg = new RegExp(/\//, "g")
        var startTime = data.billingTime[0].replace(reg, '-');
        let endTime = data.billingTime[1].replace(reg, '-')
        sql += ` and m.billingTime >='${startTime}' and m.billingTime <= '${endTime}'`
    }
    if (data.entryDate) {
        var reg = new RegExp(/\//, "g")
        var startTime = data.entryDate[0].replace(reg, '-');
        let endTime = data.entryDate[1].replace(reg, '-')
        sql += ` and m.entryDate >='${startTime}' and m.entryDate <= '${endTime}'`
    }
    if (data.minPrice) {
        sql += ` and m.totalTaxSum >='${data.minPrice}'`
    }
    if (data.maxPrice) {
        sql += ` and m.totalTaxSum <= '${data.maxPrice}'`
    }

    let n = (data.current - 1) * 10;
    sql += ` order by m.id desc limit ${n},10 `
    console.log(sql);

    return exec(sql).then(rows => {
        return rows || {}
    })


}
const getAllBillData = data =>{
    var sql = `
        select m.id,m.invoiceDataCode,m.invoiceTypeCode,m.salesName,m.totalTaxSum,m.entryDate,
        z.zymc,b.bmmc,t.type_name,d.fp_detail,u.username,m.fp_gsr,m.fp_gsbm from fp_main as m 
        inner join fp_detail as d on m.id = d.fp_id 
        left join pub_zyxx as z on z.id = m.fp_gsr
        inner join pub_bmxx as b on b.id = m.fp_gsbm
        inner join fp_type  as t on m.invoiceTypeCode = t.type_id
        left join pub_user  as u on u.id = m.fp_czy
        where m.fp_gsdw = '${data.dwbm}' and m.is_delete = 0
    `
    if (data.invoiceDataCode) {
        sql += ` and m.invoiceDataCode = '${data.invoiceDataCode}'`
    }
    if (data.invoiceNumber) {
        sql += ` and m.invoiceNumber = '${data.invoiceNumber}'`
    }
    if (data.salesName) {
        sql += ` and m.salesName like '%${data.salesName}%'`
    }
    if (data.invoiceTypeCode) {
        sql += ` and m.invoiceTypeCode = '${data.invoiceTypeCode}'`
    }
    if (data.fp_gsbm) {
        sql += ` and m.fp_gsbm = '${data.fp_gsbm}'`
    }
    if (data.billingTime) {
        var reg = new RegExp(/\//, "g")
        var startTime = data.billingTime[0].replace(reg, '-');
        let endTime = data.billingTime[1].replace(reg, '-')
        sql += ` and m.billingTime >='${startTime}' and m.billingTime <= '${endTime}'`
    }
    if (data.entryDate) {
        var reg = new RegExp(/\//, "g")
        var startTime = data.entryDate[0].replace(reg, '-');
        let endTime = data.entryDate[1].replace(reg, '-')
        sql += ` and m.entryDate >='${startTime}' and m.entryDate <= '${endTime}'`
    }
    if (data.minPrice) {
        sql += ` and m.totalTaxSum >='${data.minPrice}'`
    }
    if (data.maxPrice) {
        sql += ` and m.totalTaxSum <= '${data.maxPrice}'`
    }
    return exec(sql).then(rows => {
        return rows || {}
    })
}
// 获取查询条件下发票总数
const getBillListTotal = (data) => {

    var sql = `
        select count(m.id) as total  from fp_main as m
        where m.fp_gsdw = '${data.dwbm}' and m.is_delete = 0
    `
    if (data.invoiceDataCode) {
        sql += ` and m.invoiceDataCode = '${data.invoiceDataCode}'`
    }
    if (data.invoiceNumber) {
        sql += ` and m.invoiceNumber = '${data.invoiceNumber}'`
    }
    if (data.salesName) {
        sql += ` and m.salesName like '%${data.salesName}%'`
    }
    if (data.invoiceTypeCode) {
        sql += ` and m.invoiceTypeCode = '${data.invoiceTypeCode}'`
    }
    if (data.fp_gsbm) {
        sql += ` and m.fp_gsbm = '${data.fp_gsbm}'`
    }
    if (data.billingTime) {
        var reg = new RegExp(/\//, "g")
        var startTime = data.billingTime[0].replace(reg, '-');
        let endTime = data.billingTime[1].replace(reg, '-')
        sql += ` and m.billingTime >='${startTime}' and m.billingTime <= '${endTime}'`
    }
    if (data.entryDate) {
        var reg = new RegExp(/\//, "g")
        var startTime = data.entryDate[0].replace(reg, '-');
        let endTime = data.entryDate[1].replace(reg, '-')
        sql += ` and m.entryDate >='${startTime}' and m.entryDate <= '${endTime}'`
    }
    if (data.minPrice) {
        sql += ` and m.totalTaxSum >='${data.minPrice}'`
    }
    if (data.maxPrice) {
        sql += ` and m.totalTaxSum <= '${data.maxPrice}'`
    }

    return exec(sql).then(rows => {
        return rows[0] || {}
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
const getOnlyToken = data => {
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
const saveMainBillByScan = (data) => {
    // 获取当前时间
    let entryDate = new Date().toLocaleDateString();

    var sql = `
        insert  into fp_main 
        (invoiceTypeCode,invoiceTypeName,checkDate,checkNum,invoiceDataCode,invoiceNumber,
            billingTime,taxDiskCode,fp_checktype,fp_czy,fp_gsr,fp_gsbm,fp_gsdw,fp_bz,
            entryDate,totalTaxNum,totalTaxSum,salesName) 
        values ('${data.invoiceTypeCode}','${data.invoiceTypeName}','${data.checkDate}','${data.checkNum}','${data.invoiceDataCode}','${data.invoiceNumber}',
        '${data.billingTime}','${data.taxDiskCode}','${data.fp_checktype}','${data.uid}',
        ${data.fp_gsr == '' ? null : data.fp_gsr},'${data.fp_gsbm}','${data.fp_gsdw}','${data.fp_bz}',
        '${entryDate}',${data.totalTaxNum},${data.totalTaxSum},'${data.salesName}')
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
        update fp_main set fp_gsr =  ${data.fp_gsr == '' ? null : data.fp_gsr} ,fp_gsbm = '${data.fp_gsbm}',fp_bz = '${data.fp_bz}'
        where id = '${id}'
    `
    console.log(sql);

    return exec(sql).then(rows => {
        return rows;
    })
}
const deleteBills = data => {
    const sql = `
        update fp_main set is_delete = 1 where id in (${data.ids})
    `
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
    getBillType,
    deleteBills,
    accessToken,
    getOnlyToken,
    getBillListTotal,
    getAllBillData
}