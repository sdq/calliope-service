'use strict';

const Service = require('egg').Service;

class ActivityService extends Service {
    async post(uid, ip, action, objectid, meta) {
        const { app } = this;
        const doc = {
            uid: uid,
            ip: ip,
            action: action,
            objectid: objectid,
            meta: meta,
            time: new Date(),
        };
        const options = {};
        const args = { doc, options };
        const response = await app.mongo.insertOne('activity', args);
        return response.insertedCount === 1;
    }
}

module.exports = ActivityService;