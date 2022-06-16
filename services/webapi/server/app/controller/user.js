'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
    async login() {
        const { ctx, app, service } = this;
        const authurl = service.user.getAuthUrl();
        ctx.body = { url: authurl };
        ctx.status = 302;
    }

    async logintest() {
        const { ctx, app, service } = this;
        ctx.session.uid = 1;
        ctx.session.token = "admin"
        ctx.status = 200;
    }

    async logout() {
        const { ctx } = this;
        ctx.session = null;
        ctx.status = 200;
    }

    async authorization() {
        const { ctx, app, service } = this;
        const authurl = service.user.getAuthUrl();
        if ('token' in ctx.session) {
            const userresult = await service.user.checkToken(token);
            if (userresult !== {}) {
                ctx.session.uid = userresult.uid;
                ctx.status = 200;
            } else {
                ctx.body = { url: authurl };
                ctx.status = 302;
            }
        } else {
            ctx.body = { url: authurl };
            ctx.status = 302;
        }
    }

    async accessToken() {
        const { ctx, app, service } = this;
        ctx.validate({ 
            code: { type: 'string', required: true },
        }, ctx.request.body);
        const code = ctx.request.body.code;
        const userdata = await service.user.accessToken(code);
        if ('token' in userdata) {
            ctx.session.uid = userdata['uid'];
            ctx.session.token = userdata['token'];
            ctx.body = {
                success: true,
                user: userdata
            };
        } else {
            ctx.body = { success: false };
        }
        ctx.status = 200;
    }

    async checkToken() {
        const { ctx, app, service } = this;
        ctx.validate({ 
            token: { type: 'string', required: true },
        }, ctx.request.header);
        const token = ctx.request.header.token;
        const active = await service.user.checkTokenActive(token);
        ctx.body = { 
            success: active,
        };
        ctx.status = 200;
    }
}

module.exports = UserController;