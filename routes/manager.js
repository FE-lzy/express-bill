var express = require('express')
var router = express.Router();
const { queryAllUser, queryZyxx, queryAllBm, queryZyxxTotal, queryBmTotal, saveOrUpdatePart, deletePart, saveOrUpdateZy } = require('../controller/manager')
const { getLsToken } = require('../controller/ls')
const { SuccessModel, ErrorModel } = require('../model/resModel')

// 查询所有员工
router.post('/queryZyxx', function (req, res, next) {
    console.log(req.body);
    queryZyxxTotal(req.body).then(totalData => {
        // console.log(total);
        if (totalData.total > 0) {
            queryZyxx(req.body).then(result => {
                if (result) {
                    // result.total = totalData.total;
                    result = Object.assign({ data: result }, totalData)
                    res.json(
                        new SuccessModel(result)
                    )
                }
            })
        } else {
            res.json(
                new SuccessModel([])
            )
        }

    }).catch(err => {
        res.json(
            new ErrorModel(err)
        )
    })
});

// 获取所有部门
router.post('/queryAllBm', function (req, res, next) {
    console.log(req.body);
    queryBmTotal(req.body).then(totalData => {

        console.log(totalData.total);
        if (totalData.total > 0) {
            queryAllBm(req.body).then(result => {
                console.log(result);
                if (result) {
                    result = Object.assign({ data: result }, totalData)
                    res.json(
                        new SuccessModel(result)
                    )
                }
            }).catch(err => {
                res.json(
                    new ErrorModel(err)
                )
            })
        } else {
            res.json(
                new SuccessModel([])
            )
        }
    }).catch(err => {
        res.json(
            new ErrorModel(err)
        )
    })

});

router.post('/saveOrUpdatePart', function (req, res, next) {
    saveOrUpdatePart(req.body).then(result => {
        console.log(result);
        if (result) {
            res.json(
                new SuccessModel()
            )
        } else {
            res.json(
                new ErrorModel('操作失败')
            )
        }
    }).catch(err => {
        res.json(
            new ErrorModel(err)
        )
    })
});

router.post('/deletePart', function (req, res, next) {
    deletePart(req.body).then(result => {
        if (result) {
            res.json(
                new SuccessModel()
            )
        } else {
            res.json(
                new ErrorModel('操作失败')
            )
        }
    }).catch(err => {
        res.json(
            new ErrorModel(err)
        )
    })
});

router.post('/saveOrUpdateZy', function (req, res, next) {
    saveOrUpdateZy(req.body).then(result => {
        console.log(result);
        if (result) {
            res.json(
                new SuccessModel()
            )
        } else {
            res.json(
                new ErrorModel('操作失败')
            )
        }
    }).catch(err => {
        res.json(
            new ErrorModel(err)
        )
    })
})
router.post('/queryAllUser', function (req, res, next) {
    queryAllUser(req.body).then(result => {
        if (result) {
            res.json(
                new SuccessModel(result)
            )
        } else {
            res.json(
                new ErrorModel('操作失败')
            )
        }
    }).catch(err => {
        res.json(
            new ErrorModel(err)
        )
    })
})
module.exports = router;