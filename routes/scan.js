var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var request = require('request')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { getBaiduToken } = require('../controller/baidu')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 接收到文件后输出的保存路径（若不存在则需要创建）
        cb(null, 'upload/');
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
        // console.log(file.originalname.split('.'));
        let fileArr = file.originalname.split('.')
        cb(null, Date.now() + "-" + Math.floor(Math.random() * 1000) + '.' + fileArr[fileArr.length - 1]);
    }
});

// 创建文件夹
var createFolder = function (folder) {
    try {
        // 测试 path 指定的文件或目录的用户权限,我们用来检测文件是否存在
        // 如果文件路径不存在将会抛出错误"no such file or directory"
        fs.accessSync(folder);
    } catch (e) {
        // 文件夹不存在，以同步的方式创建文件目录。
        fs.mkdirSync(folder);
    }
};

var uploadFolder = '../upload/';
createFolder(uploadFolder);
// 创建 multer 对象
var upload = multer({ storage: storage });

var urlApi = 'https://aip.baidubce.com/rest/2.0/solution/v1/iocr/recognise/finance';
router.post('/upload', upload.single('file'), function (req, res, next) {
    var file = req.file;
    // console.log('文件类型：%s', file.mimetype);
    // console.log('原始文件名：%s', file.originalname);
    // console.log('文件大小：%s', file.size);
    // console.log('文件保存路径：%s', file.path);
    // console.log(__dirname + file.path);
    getBaiduToken().then(access_token => {
        console.log('token ', access_token);
        let fileName = file.path;
        fileName = fileName.replace(/\\/g, "/");
        // console.log('__dirname', __dirname);
        let imageUrl = __dirname.replace(/\\/g, "/") + '/../' + fileName;
        requestData = {
            image: fs.readFileSync(imageUrl).toString("base64")
        }
        urlApi += '?access_token=' + access_token
        console.log(urlApi);
        request.post(urlApi, { form: { image: decodeURIComponent(fs.readFileSync(imageUrl).toString("base64")), detectorId: 0 } },
            function (err, httpResponse, body) {
                if (err) {
                    return res.json(
                        new ErrorModel(err)
                    )
                }
                let result = JSON.parse(body);
                if (result.error_code == 0) {
                    console.log(result.data)
                    return res.send(
                        new SuccessModel({ data: result.data, image: fileName })
                    )
                } else {
                    return res.send(
                        new ErrorModel({ error_code: result.error_code })
                    )
                }
            })

    })

});

module.exports = router;