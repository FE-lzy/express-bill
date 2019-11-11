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

// const getUserToken = (usrename) => {
//     // jwt获取token
//     var connect = { username:usrename };// 要生成token的主题信息
//     let secret = "jwt";// 这是加密的key（密钥）
//     let token = jwt.sign(connect, secret, {
//         expiresIn: 60 * 60 * 24 * 3  //三天失效
//     })
//     return token;
// }
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
        let str = 'Bearer ' +token;

        console.log('验证前  '+token)
        var info = jwt.verify(token, signkey ,(error, decoded) => {
           
            console.log('验证  '+token)
            if (error) {
              console.log(error.message)
              return
            }
            console.log(decoded)
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
