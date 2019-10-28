const { exec,escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp') 

const login = (username,password) => {
    username = escape(username)
    // 生成加密的密码
    password =  escape(genPassword(password))

    const sql =  `
        select  * from user where username=${username} and password=${password}
    `

    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}

module.exports = {
    login
}
