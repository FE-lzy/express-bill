const { exec, escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')
const jwt= require('jsonwebtoken'); 
const login = (username, password) => {
    username = escape(username)
    // 生成加密的密码
    password = escape(genPassword(password))

    const sql = `
        select  * from user where username=${username} and password=${password}
    `

    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}
const userInfo = (uId) => {
    
    const sql = `
        select  * from user where id=${uId}
    `

    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}

const getUserToken = (usrename) => {
    // jwt获取token
    var connect = { username:usrename };// 要生成token的主题信息
    let secret = "jwt";// 这是加密的key（密钥）
    let token = jwt.sign(connect, secret, {
        expiresIn: 60 * 60 * 24 * 3  //三天失效
    })
    return token;
}

module.exports = {
    login,
    userInfo,
    getUserToken
}
