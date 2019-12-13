
var querystring = require('querystring');
var request = require('request')
// 请求token


const post_data = {
    grant_type:'client_credentials',
    client_id:'gXbBaH54suDDgtem30gXmPbM',
    client_secret:'hASeuR69eOIjxwbVvawG87BzKOSE7aA9'
}
const urlApi = 'https://aip.baidubce.com/oauth/2.0';

function getBaiduToken() {
    let contens = querystring.stringify(post_data); // 转换json
    let url = urlApi + '/token?' + contens;
    // get请求获取token
    var promise = new Promise(function (reslove, reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(JSON.parse(body));
                let baidu_token = JSON.parse(body);
                reslove(baidu_token)
            } else {
                reject(error)
            }
        });
    });
    return promise
}
module.exports = {
    getBaiduToken
}