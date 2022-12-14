const qiniu = require("qiniu")
const axios = require("axios")
const Store = require("electron-store")
const fs = require("fs")
const settingStore = new Store({
    name: 'settings'
})

class QiniuyunManage {
    constructor(accessKey, secretKey, bucket) {
        this.bucket = bucket;
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;
        this.cdnManager = new qiniu.cdn.CdnManager(this.mac);
        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    }

    uploadFile(path, key) {
        const options = {
            scope: this.bucket + ':' + key,
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(this.mac)
        var formUploader = new qiniu.form_up.FormUploader(this.config);
        var putExtra = new qiniu.form_up.PutExtra();
        return new Promise((resolve, reject) => {
            formUploader.putFile(uploadToken, key, path, putExtra, this._handleCallback(resolve, reject));
        })
    }

    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve, reject));
        })
    }

    // 获取七牛云的虚拟域名
    getBucketDomain() {
        const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
        const digest = qiniu.util.generateAccessToken(this.mac, reqURL)
        return new Promise((resolve, reject) => {
            qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject))
        })
    }

    generateDownloadLink(key) {
        const domainPromise = this.publicBucketDomain ?
            Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
        return domainPromise.then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const pattern = /^https?/
                this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
                return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key)
            } else {
                throw Error('域名未找到，请查看存储空间是否已经过期')
            }
        })
    }

    downloadFile(key, downloadPath) {
        // step 1 get the download link
        // step 2 send the request to download link, return a readable stream
        // step 3 create a writable stream and pipe to it
        // step 4 return a promise based result
        return this.generateDownloadLink(key).then(link => {
            return new Promise((resolve, reject) => {
                this.cdnManager.refreshUrls([link], this._handleCallback(resolve, reject))
            }).then(res => {
                const timeStamp = new Date().getTime()
                const url = `${link}?timestamp=${timeStamp}`
                return axios({
                    url,
                    method: 'GET',
                    responseType: 'stream',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                })
            }).catch(err => console.log(err))
        }).then(response => {
            const writer = fs.createWriteStream(downloadPath)
            response.data.pipe(writer)
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve)
                writer.on('error', reject)
            })
        }).catch(err => {
            return Promise.reject({
                err: err.response
            })
        })
    }

    getStat(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.stat(this.bucket, key, this._handleCallback(resolve, reject))
        })
    }

    _handleCallback(resolve, reject) {
        return (respErr, respBody, respInfo) => {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode === 200) {
                resolve(respBody)
            } else {
                reject({
                    statusCode: respInfo.statusCode,
                    body: respBody
                })
            }
        }
    }
}

const createQiniuManage = () => {
    return new QiniuyunManage(settingStore.get('accessKey'), settingStore.get('secretKey'), settingStore.get('bucketName'))
}

module.exports = createQiniuManage