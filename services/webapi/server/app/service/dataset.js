'use strict';

const Service = require('egg').Service;

class DatasetService extends Service {
    async post(uid, data, keywords, source, file, size, schema) {
        const result = await this.app.mysql.insert('dataset', { 
            uid: uid,
            data: data,
            keywords: keywords,
            source: source,
            url: file,
            size: size,
            schema: schema,
        });
        if (result.affectedRows === 1) {
            // delete cache for first dataset page
            let key = "dataset:0:10::time";
            await this.service.cache.delete(key);
            return result.insertId;
        } else {
            return -1;
        }
    }

    async get(page, per_page, keywords, sort) {
        let key = "dataset:" + page + ":" + per_page + ":" + keywords + ":" + sort;
        let cacheResult = await this.service.cache.get(key);
        if (cacheResult) {
            return cacheResult;
        }
        let datasets = [];
        let total = {};
        if (keywords !== "") {
            const searchResult = await this.service.search.dataset(keywords, page, per_page, sort);
            datasets = searchResult.datasets;
            total = searchResult.total;
        } else {
            let orders = [['added','desc']];
            datasets = await this.app.mysql.select('dataset', {
                where: { isdelete: 0 },
                orders: orders,
                limit: per_page,
                offset: page * per_page
            });
        }
        for (const key in datasets) {
            datasets[key].user = await this.app.mysql.get('user', { uid: datasets[key].uid });
        }
        const getResult = {
            total: total,
            datasets: datasets
        };
        await this.service.cache.set(key, getResult, 60);
        return getResult;
    }

    async getByID(did) {
        let key = "dataset:" + did;
        let cacheResult = await this.service.cache.get(key);
        if (cacheResult) {
            return cacheResult;
        }
        const dataset = await this.app.mysql.get('dataset', { did: did });
        if (dataset === null || dataset === undefined) {
            return {}
        }
        dataset.user = await this.app.mysql.get('user', { uid: dataset.uid });
        // TODO: SQL optimization
        // const dataset = await this.app.mysql.query('SELECT A.*, B.* FROM dataset as A JOIN user as B ON A.did = ? AND A.uid = B.uid', [did]);
        const getResult = dataset;
        await this.service.cache.set(key, getResult, 60);
        return getResult;
    }

    async putByID(uid, did, data, keywords, source) {
        const row = {
            data: data,
            keywords: keywords,
            source: source,
        };
        const options = {
            where: {
                did: did,
                uid: uid,
            }
        };
        const result = await this.app.mysql.update('dataset', row, options);
        return result.affectedRows === 1;
    }

    async getByUser(uid, page, per_page) {
        // let key = "user:" + uid + ":dataset:" + page + ":" + per_page;
        // let cacheResult = await this.service.cache.get(key);
        // if (cacheResult) {
        //     return cacheResult;
        // }
        const datasets = await this.app.mysql.select('dataset', {
            where: { uid: uid, isdelete: 0 },
            orders: [['did','desc']],
            limit: per_page,
            offset: page * per_page
        });
        const getResult = datasets;
        // await this.service.cache.set(key, getResult, 60);
        return getResult;
    }

    async deleteByID(uid, did) {
        const row = {
            isdelete: 1,
        };
        const options = {
            where: {
                did: did,
                uid: uid,
            }
        };
        const result = await this.app.mysql.update('dataset', row, options);
        return result.affectedRows === 1;
    }
}

module.exports = DatasetService;