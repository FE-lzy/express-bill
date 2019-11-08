var express = require('express')
var router = express.Router();
const { login, getUserToken, userInfo } = require('../controller/user')
const { getLsToken } = require('../controller/ls')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.post('/login', function (req, res, next) {
    const { username, password } = req.body;
    const result = login(username, password)

    return result.then(data => {
        console.log(data);
        if (data.username) {
            getLsToken().then(lsToken => {
                console.log(lsToken);
                if (lsToken) {
                    let uToken = getUserToken(data.username)
                    let roles = data.roles.slice('')
                    console.log(roles);
                    res.json(
                        new SuccessModel({ token: lsToken, uToken: uToken, user: data, roles: roles })
                    )
                }
            })

            return
        }
        res.json(
            new ErrorModel('用户名或密码错误')
        )

    })
});
router.post('/userInfo', function (req, res, next) {
    const { id } = req.body;
    const result = userInfo(id);
    return result.then(data => {
        console.log(data)
        if (data) {
            res.json(
                new SuccessModel({ roles: [data.roles], name: data.username })
            )
            return
        }
        res.json(
            new ErrorModel('获取用户信息失败')
        )


    })

})


module.exports = router;