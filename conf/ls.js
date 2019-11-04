const post_data = {
    appKey: 'd0a84cb2b65e42478a0f8b9cec178dd0',
    appSecret: 'bc7fb0fa-5670-402c-99e6-26e89abb368c'
}
const urlApi = 'https://open.leshui365.com';

const postQueryParam = (url,body) =>{
    return {
        url: urlApi +　url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: body
    }
}

module.exports = {
    post_data,
    urlApi,
    postQueryParam
}