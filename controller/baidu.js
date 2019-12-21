
var querystring = require('querystring');
var request = require('request')
var fs = require('fs');
// 请求token


const post_data = {
    grant_type: 'client_credentials',
    client_id: 'gXbBaH54suDDgtem30gXmPbM',
    client_secret: 'hASeuR69eOIjxwbVvawG87BzKOSE7aA9'
}
const urlApi = 'https://aip.baidubce.com/oauth/2.0';

function getBaiduToken() {
    let contens = querystring.stringify(post_data); // 转换json
    let url = urlApi + '/token?' + contens;

    var promise = new Promise(function (reslove, reject) {
        fs.readFile('./utils/baidu_access_token.json', (err, data) => {
            if (err) reject(err);
            if (data && JSON.parse(data.toString()) && JSON.parse(data.toString()).expires_time > (new Date()).getTime()) {
                console.log('从文件中获取的token');
                reslove(JSON.parse(data.toString()).access_token);
            } else {
                // get请求获取token
                request(url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // console.log(JSON.parse(body));
                        let baidu_token = JSON.parse(body);
                        baidu_token.expires_time = (new Date()).getTime() + baidu_token.expires_in;
                        fs.writeFile('./utils/baidu_access_token.json', JSON.stringify(baidu_token), err => {
                            if (err) throw err;
                            console.log('write over');
                        });
                        reslove(baidu_token.access_token)
                    } else {
                        reject(error)
                    }
                });
            }
        });
    });

    return promise

}
module.exports = {
    getBaiduToken
}