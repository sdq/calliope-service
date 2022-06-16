'use strict';

const Controller = require('egg').Controller;

class DatasetController extends Controller {

    async post() {
        const { ctx, app, service } = this;
        if (!('uid' in ctx.session && 'token' in ctx.session)) {
            ctx.body = {
                message: "please login first"
            }; 
            ctx.status = 401; 
            return;
        }
        const token = ctx.session.token;
        const isActive = await service.user.checkTokenActive(token);
        if (!isActive && token!=="admin") {
            ctx.body = {
                message: "token is inactive, please login again"
            }; 
            ctx.status = 401; 
            return;
        }
        const uid = ctx.session.uid;
        ctx.validate({ 
            data: { type: 'string', required: true },
            keywords: { type: 'string', required: false },
            source: { type: 'string', required: false },
            file: { type: 'string', required: false }, // file url
            size: { type: 'int', required: true},
            schema: { type: 'string', required: true},
        }, ctx.request.body);
        const insertid = await service.dataset.post(uid, ctx.request.body.data, ctx.request.body.keywords, ctx.request.body.source, ctx.request.body.file, ctx.request.body.size, ctx.request.body.schema);
        const success = insertid !== -1;
        ctx.body = { 
            success: success,
            did: insertid,
        };
        if (success) {
            ctx.status = 201;
        } else {
            ctx.status = 400;
        }
    }

    async get() {
        const { ctx, app, service } = this;
        const query = ctx.request.query;
        let page = 0, per_page = 20, keywords = '', sort = 'time';
        if ('page' in query) {
            page = parseInt(query.page);
        }
        if ('per_page' in query) {
            per_page = parseInt(query.per_page);
        }
        if ('keywords' in query) {
            keywords = query.keywords;
        }
        if ('sort' in query) {
            sort = query.sort;
        }
        const result = await service.dataset.get(page, per_page, keywords, sort);
        ctx.body = result;
        ctx.status = 200;
    }

    async getByID() {
        const { ctx, app, service } = this;
        const did = ctx.params.did;
        const dataset = await service.dataset.getByID(did);
        ctx.body = dataset;
        ctx.status = 200;
    }

    async getByUser() {
        const { ctx, app, service } = this;
        const uid = ctx.params.uid;
        const query = ctx.request.query;
        let page = 0, per_page = 20;
        if ('page' in query) {
            page = parseInt(query.page);
        }
        if ('per_page' in query) {
            per_page = parseInt(query.per_page);
        }
        const datasets = await service.dataset.getByUser(uid, page, per_page);
        ctx.body = datasets;
        ctx.status = 200;
    }

    async putByID() {
        const { ctx, app, service } = this;
        if (!('uid' in ctx.session && 'token' in ctx.session)) {
            ctx.body = {
                message: "please login first"
            }; 
            ctx.status = 401; 
            return;
        }
        const token = ctx.session.token;
        const isActive = await service.user.checkTokenActive(token);
        if (!isActive && token!=="admin") {
            ctx.body = {
                message: "token is inactive, please login again"
            }; 
            ctx.status = 401; 
            return;
        }
        const uid = ctx.session.uid;
        const did = ctx.params.did;
        ctx.validate({ 
            data: { type: 'string', required: true },
            keywords: { type: 'string', required: true },
            source: { type: 'string', required: true },
        }, ctx.request.body);
        const success = await service.dataset.putByID(uid, did, ctx.request.body.data, ctx.request.body.keywords, ctx.request.body.source);
        ctx.body = { success: success };
        if (success) {
            ctx.status = 200;
        } else {
            ctx.status = 400;
        }
    }

    async deleteByID() {
        const { ctx, app, service } = this;
        if (!('uid' in ctx.session && 'token' in ctx.session)) {
            ctx.body = {
                message: "please login first"
            }; 
            ctx.status = 401; 
            return;
        }
        const token = ctx.session.token;
        const isActive = await service.user.checkTokenActive(token);
        if (!isActive && token!=="admin") {
            ctx.body = {
                message: "token is inactive, please login again"
            }; 
            ctx.status = 401; 
            return;
        }
        const uid = ctx.session.uid;
        const did = ctx.params.did;
        const success = await service.dataset.deleteByID(uid, did);
        ctx.body = { success: success };
        if (success) {
            ctx.status = 204;
        } else {
            ctx.status = 400;
        }
    }
}

module.exports = DatasetController;