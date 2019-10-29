const mysql = require('mysql')
const { MySQL_CONF } = require('../conf/db')

// 创建链接对象
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    port: '3306',
    database: 'bill'
})

// 开始链接
con.connect();


// 定义统一的sql函数
function exec(sql) {
    console.log('请求：',sql);
    // 一个promise异步请求,返回一个异步函数
    const promise = new Promise((resolve, reject) => {
        con.query(sql,(err,result) =>{
            if(err){
                reject(err)
                return
            }
            console.log('结果',result);
            resolve(result)
        })
    })
    
    return promise
}

// 导出
module.exports = {
    exec,
    escape: mysql.escape
}