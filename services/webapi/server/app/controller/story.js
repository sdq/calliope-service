'use strict';

const Controller = require('egg').Controller;

class StoryController extends Controller {
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
            did: { type: 'int', required: true },
            title: { type: 'string', required: true },
            description: { type: 'string', required: true },
            json: { type: 'string', required: true },
        }, ctx.request.body);
        const did = ctx.request.body.did;
        const title = ctx.request.body.title;
        const description = ctx.request.body.description;
        const json = ctx.request.body.json;
        const insertid = await service.story.post(uid, did, title, description, json);
        const success = insertid !== -1;
        ctx.body = { 
            success: success,
            sid: insertid,
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
        const result = await service.story.get(page, per_page, keywords, sort)
        ctx.body = result;
        ctx.status = 200;
    }

    async getByID() {
        const { ctx, app, service } = this;
        const sid = ctx.params.sid;
        const story = await service.story.getByID(sid);
        ctx.body = { 
            success: true,
            story: story
        };
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
        const stories = await service.story.getByUser(uid, page, per_page);
        ctx.body = stories;
        ctx.status = 200;
    }

    async getByData() {
        const { ctx, app, service } = this;
        const did = ctx.params.did;
        const query = ctx.request.query;
        let page = 0, per_page = 20;
        if ('page' in query) {
            page = parseInt(query.page);
        }
        if ('per_page' in query) {
            per_page = parseInt(query.per_page);
        }
        const stories = await service.story.getByData(did, page, per_page);
        ctx.body = stories;
        ctx.status = 200;
    }

    async share() {
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
        const sid = ctx.params.sid;
        const link = await service.story.share(uid, sid)
        if (link) {
            ctx.body = { 
                url: link
            };
            ctx.status = 200;
        } else {
            ctx.status = 400;
        }
    }

    async public() {
        const { ctx, app, service } = this;
        const uuid = ctx.params.uuid;
        const sharedstory = await service.story.public(uuid)
        if (sharedstory) {
            ctx.body = {sharedstory};
            ctx.status = 200;
        } else {
            ctx.status = 400;
        }
    }

    async rating() {
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
        const sid = ctx.params.sid;
        ctx.validate({ 
            rate: { type: 'number', required: true },
        }, ctx.request.body);
        const rate = ctx.request.body.rate;
        if (rate>5 || rate<1) {
            ctx.status = 400;
        }
        const success = await service.story.rating(uid, sid, rate);
        ctx.body = { success: success };
        if (success) {
            ctx.status = 201;
        } else {
            ctx.status = 400;
        }
    }

    async getRating() {
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
        const sid = ctx.params.sid;
        const rating = await service.story.getRating(sid, uid);
        ctx.body = {rating};
        ctx.status = 200;
    }

    async view() {
        const { ctx, app, service } = this;
        const sid = ctx.params.sid;
        const success = await service.story.view(sid);
        ctx.body = { success: success };
        if (success) {
            ctx.status = 200;
        } else {
            ctx.status = 400;
        }
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
        const sid = ctx.params.sid;
        ctx.validate({ 
            title: { type: 'string', required: true },
            description: { type: 'string', required: true },
            json: { type: 'string', required: true },
        }, ctx.request.body);
        const success = await service.story.putByID(uid, sid, ctx.request.body.title, ctx.request.body.description, ctx.request.body.json);
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
        const sid = ctx.params.sid;
        const success = await service.story.deleteByID(uid, sid);
        if (success) {
            ctx.body = { success: true };
            ctx.status = 204;
        } else {
            ctx.body = { success: false };
            ctx.status = 400;
        }
    }
}

module.exports = StoryController;