'use strict'

const axios = require(`axios`);
const APIKEY = `5a66786144575a5546575177676e78306b6558414b755a796356374c45736d586b3976584b525841616e44`; //API KEY
const BASE_URL = `https://api.apigw.smt.docomo.ne.jp/gooLanguageAnalysis/v1/hiragana`;
const SENTECE = process.argv[2];
const OUTPU_TYPE = `katakana`; //or `hiragana`

const options = {
    method: 'post',
    url: BASE_URL,
    headers: {
        // 'Content-Type': `application/x-www-form-urlencoded`,
        'Content-Type': `application/json`
    },
    data: {
        app_id: APIKEY,
        sentence: SENTECE,
        output_type: OUTPU_TYPE
    }
};

axios(options)
.then((res) => {
    console.log(res.data);
})
.catch((err) => {
    console.log(err);
});