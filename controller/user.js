const { exec, escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')
var querystring = require('querystring');
const { post_data, urlApi, postQueryParam } = require('../conf/ls')
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
        return rows[0]
    })
}
const getLsToken = data =>{
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
const resetPwd = data =>{
    let password = escape(genPassword(data.password))
    let oldpwd = escape(genPassword(data.oldpwd))
    const sql = `
        update pub_user set password = ${password} where id = ${data.id} and password = ${oldpwd}
    `
    return exec(sql).then(rows => {
        return rows
    })
}

var signkey = 'mes_qdhd_mobile_xhykjyxgs';
const setToken = function (username) {
    return new Promise((resolve, reject) => {
        const token = jwt.sign({
            username: username
        }, signkey, { expiresIn:  60 * 60 * 24 * 3 });

        console.log('token',token);
        resolve(token);
    })
}
const verToken = function (token) {
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
    verToken,
    resetPwd,
    getLsToken
}
