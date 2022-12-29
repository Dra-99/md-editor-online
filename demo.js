const QiniuyunManage = require("./src/QiniuyunManage")
const accessKey = 'oMVSYTL9MLGIdbmeQN1d6gcBgToccspu38bTEMtB';
const secretKey = '-u6-PF-YUGvXN1D1KSJY7mhSPCY4gc8ETBTRbbw5';

const qiniuyun = new QiniuyunManage(accessKey, secretKey, 'md-cloud-dra');
qiniuyun.uploadFile('./me.jpg', 'test`.jpg').then(res => {
    console.log(res);
}).catch(err => console.log(err))


// var bucketManager = new qiniu.rs.BucketManager(mac, config);
// var publicBucketDomain = 'http://rnlhf8aae.hd-bkt.clouddn.com';

// // 公开空间访问链接
// var publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key);
// console.log(publicDownloadUrl);

