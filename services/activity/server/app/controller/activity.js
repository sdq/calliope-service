'use strict';

const Controller = require('egg').Controller;

class ActivityController extends Controller {
    async post() {
        const { ctx, app, service } = this;
        const uid = ctx.params.uid;
        const ip = ctx.request.ip;
        ctx.validate({ 
            action: { type: 'int', required: true },
            objectid: { type: 'int', required: true },
            meta: { type: 'string', required: false },
        }, ctx.request.body);
        const success = await service.activity.post(uid, ip, ctx.request.body.action, ctx.request.body.objectid, ctx.request.body.meta);
        if (success) {
            ctx.status = 201;
        } else {
            ctx.status = 400;
        }
    }
}

module.exports = ActivityController;