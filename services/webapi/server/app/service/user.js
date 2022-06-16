'use strict';

const Service = require('egg').Service;
// const baseUrl = "http://202.120.188.239:8000";
const baseUrl = "http://172.17.0.1:8000";
const authorizeUrl = baseUrl + "/oauth/authorize";
const tokenUrl = baseUrl + "/oauth/token";
const checkTokenUrl = baseUrl + "/oauth/check_token";
const client_id = "xxx";
const client_secret = "xxx";
const redirect_uri = "https://datacalliope.com";

class UserService extends Service {
    getAuthUrl() {
        return authorizeUrl + "?response_type=code&client_id="+ client_id +"&grant_type=authorization_code&redirect_uri=" + redirect_uri;
    }

    async accessToken(code) {
        const ctx = this.ctx;
        const result = await ctx.curl(tokenUrl, {
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            data: {
                code: code,
                grant_type: 'authorization_code',
                client_id: client_id,
                client_secret: client_secret,
                redirect_uri: redirect_uri
            },
            dataType: 'json',
        }); 
        let data = result.data;
        if ('access_token' in data) {
            const username = data['fullName'];
            const accountid = data['uid'];
            const avatar = data['avatar'] ? data['avatar'] : "";
            const token = data['access_token'];
            let userresult = {
                username: username,
                accountid: accountid,
                avatar: avatar,
                token: token
            }
            const user = await this.app.mysql.get('user', { accountid: accountid });
            if (user) {
                const row = {
                    username: username,
                    avatar: avatar,
                };
                const options = {
                    where: {
                        accountid: accountid,
                    }
                };
                const result = await this.app.mysql.update('user', row, options);
                if (result.affectedRows === 1) {
                    userresult.uid = user.uid;
                }
            } else {
                const result = await this.app.mysql.insert('user', {
                    accountid: accountid,
                    username: username,
                    avatar: avatar,
                });
                if (result.affectedRows === 1) {
                    const newuser = await this.app.mysql.get('user', { accountid: accountid });
                    userresult.uid = newuser.uid;
                }
            }
            return userresult;
        } else {
            return {};
        }
    }

    async checkTokenActive(token) {
        const ctx = this.ctx;
        const result = await ctx.curl(checkTokenUrl, {
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            data: {
                token: token,
            },
            dataType: 'json',
        }); 
        if (result.status === 200 && "active" in result.data) {
            return result.data.active;
        } else {
            return false;
        }
    }

    async checkToken(token) {
        const ctx = this.ctx;
        const result = await ctx.curl(checkTokenUrl, {
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            data: {
                token: token,
            },
            dataType: 'json',
        }); 
        if (result.status === 200) {
            const data = result.data;
            const username = data['fullName'];
            const accountid = data['uid'];
            const avatar = data['avatar'] ? data['avatar'] : "";
            let userresult = {
                username: username,
                accountid: accountid,
                avatar: avatar,
            }
            const user = await this.app.mysql.get('user', { accountid: accountid });
            if (user) {
                const row = {
                    username: username,
                    avatar: avatar,
                };
                const options = {
                    where: {
                        accountid: accountid,
                    }
                };
                const result = await this.app.mysql.update('user', row, options);
                if (result.affectedRows === 1) {
                    userresult.uid = user.uid;
                }
            } else {
                const result = await this.app.mysql.insert('user', {
                    accountid: accountid,
                    username: username,
                    avatar: avatar,
                });
                if (result.affectedRows === 1) {
                    const newuser = await this.app.mysql.get('user', { accountid: accountid });
                    userresult.uid = newuser.uid;
                }
            }
            return userresult;
        } else {
            return {};
        }
    }
}

module.exports = UserService;