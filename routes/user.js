var express = require('express')
var router = express.Router();
const { resetPwd, login, getUserToken, userInfo, setToken } = require('../controller/user')
const { getLsToken } = require('../controller/ls')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.post('/login', function (req, res, next) {
    const { username, password } = req.body;
    const result = login(username, password)

    return result.then(data => {

        if (data.username) {
            console.log(data);
            getLsToken().then(lsToken => {
                console.log('lsToken');
                if (lsToken) {
                    setToken(data.username).then(token => {
                        if (token) {
                            res.json(
                                new SuccessModel({ token: lsToken, uToken: token, user: data })
                            )
                        }
                    })
                }
            }).catch(err => {
                console.error(req.path + '　' + err);
            })
        } else {
            return res.json(
                new ErrorModel('用户名或密码错误')
            )
        }


    }).catch(err => {
        console.error(req.path + '　' + err);
        return res.json(
            new ErrorModel(err)
        )
    })
});
router.post('/resetPwd', function (req, res, next) {
    return resetPwd(req.body).then(result => {
        if (result.affectedRows > 0) {
            return res.json(
                new SuccessModel(
                    result
                )
            )
        } else {
            return res.json(
                new ErrorModel('操作失败')
            )
        }
    }).catch(err => {
        return res.json(
            new ErrorModel(err)
        )
    })
})
router.post('/userInfo', function (req, res, next) {
    const { id } = req.body;
    const result = userInfo(id);
    return result.then(data => {
        console.log(!data)
        if (data.username) {
            return res.json(
                new SuccessModel({ roles: [data.roles], name: data.username })
            )
        } else {
            console.error(req.path + '　用户不存在');
            return res.json(
                new ErrorModel('用户不存在')
            )
        }

    }).catch(err => {
        console.error(req.path + '　' + err);
        return res.json(
            new ErrorModel(err)
        )
    })

})


module.exports = router;