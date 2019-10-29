var express = require('express')
var router = express.Router();
const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

router.post('/login', function (req, res, next) {
    const { username, password } = req.body;
    const result = login(username, password)
    
    return result.then(data => {
        console.log(data);
        if (data.username) {
            // req.session.username = data.username;
            // req.session.uid = data.id; 
            res.json(
                new SuccessModel()
            )
            return
        }
        res.json(
            new ErrorModel('用户名或密码错误')
        )

    })
});

router.get('/login', function (req, res, next) {

    res.json(
        {code:1}
    )

});

module.exports = router;