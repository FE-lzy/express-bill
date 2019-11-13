const { exec, escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')
const jwt = require('jsonwebtoken');
const login = (username, password) => {
    username = escape(username)
    // 生成加密的密码
    password = escape(genPassword(password))

    const sql = `
        select  * from pub_user where username=${username} and password=${password}
    `

    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}
const userInfo = (uId) => {

    const sql = `
        select  * from pub_user where id=${uId}
    `

    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}

var signkey = 'mes_qdhd_mobile_xhykjyxgs';
const setToken = function (username) {
    return new Promise((resolve, reject) => {
        const token = jwt.sign({
            username: username
        }, signkey, { expiresIn:  60 * 60 * 24 * 3 });
        // let info = jwt.verify(token.split(' ')[1], signkey)
        // console.log(info);
        console.log('token',token);
        resolve(token);
    })
}
const verToken = function (token) {
    console.log('12111s');
    return new Promise((resolve, reject) => {
        var info = jwt.verify(token, signkey ,(error, decoded) => {
            if (error) {
              console.log(error.message)
              return
            }
          });
        console.log(info);
        resolve(info);
    })
}

module.exports = {
    login,
    userInfo,
    setToken,
    verToken
}
