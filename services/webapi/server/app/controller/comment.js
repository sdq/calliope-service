'use strict';

const Controller = require('egg').Controller;

class CommentController extends Controller {
    async getByStory() {
        const { ctx, app, service } = this;
        const sid = ctx.params.sid;
        const query = ctx.request.query;
        let page = 0, per_page = 20;
        if ('page' in query) {
            page = parseInt(query.page);
        }
        if ('per_page' in query) {
            per_page = parseInt(query.per_page);
        }
        const comments = await service.comment.getByStory(sid, page, per_page);
        ctx.body = comments;
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
        const comments = await service.comment.getByUser(uid, page, per_page);
        ctx.body = comments;
        ctx.status = 200;
    }

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
        const sid = ctx.params.sid;
        ctx.validate({ 
            comment: { type: 'string', required: true },
        }, ctx.request.body);
        const insertid = await service.comment.post(uid, sid, ctx.request.body.comment);
        const success = insertid !== -1;
        ctx.body = { 
            success: success,
            cid: insertid,
        };
        if (success) {
            ctx.status = 201;   
        } else {
            ctx.status = 200;   
        }
    }

    async reply() {
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
        const cid = ctx.params.cid;
        ctx.validate({ 
            comment: { type: 'string', required: true },
        }, ctx.request.body);
        const insertid = await service.comment.reply(uid, sid, cid, ctx.request.body.comment);
        const success = insertid !== -1;
        ctx.body = { 
            success: success,
            cid: insertid,
        };
        if (success) {
            ctx.status = 201;   
        } else {
            ctx.status = 400;   
        }
    }

    async like() {
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
        const cid = ctx.params.cid;
        ctx.validate({ 
            type: { type: 'int', required: true },
            like: { type: 'bool', required: true},
        }, ctx.request.body);
        const type = ctx.request.body.type;
        const like = ctx.request.body.like;
        if (type !== 1 || type !== -1) {
            ctx.status = 400;
        }
        const success = await service.comment.like(uid, sid, cid, type, like);
        ctx.body = { 
            success: success
        };
        if (success) {
            ctx.status = 201;   
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
        const cid = ctx.params.cid;
        ctx.validate({ 
            comment: { type: 'string', required: true },
        }, ctx.request.body);
        const success = await service.comment.putByID(uid, sid, cid, ctx.request.body.comment);
        ctx.body = { 
            success: success
        };
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
        const cid = ctx.params.cid;
        const success = await service.comment.deleteByID(uid, sid, cid);
        ctx.body = { success: success };
        if (success) {
            ctx.status = 204;
        } else {
            ctx.status = 400;
        }
    }
}

module.exports = CommentController;