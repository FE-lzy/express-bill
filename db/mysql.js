const mysql = require('mysql')
const { MySQL_CONF } = require('../conf/db')

// 创建链接对象
const con = mysql.createConnection(MySQL_CONF)

// 开始链接
con.connect();


// 定义统一的sql函数
function exec(sql) {
    // 一个promise异步请求,返回一个异步函数
    const promise = new Promise((resolve, reject) => {
        con.query(sql,(err,result) =>{
            if(err){
                resolve(err)
                return
            }
            resolve(result)
        })
        return promise
    })
}

// 导出
module.exports = {
    exec,
    escape: mysql.escape
}