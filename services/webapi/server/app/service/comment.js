'use strict';

const Service = require('egg').Service;

class CommentService extends Service {
    async getByStory(sid, page, per_page) {
        const comments = await this.app.mysql.select('comment', {
            where: { sid: sid, isdelete: 0 },
            orders: [['time','desc']],
            // limit: per_page,
            // offset: page * per_page
        });
        for (const key in comments) {
            comments[key].user = await this.app.mysql.get('user', { uid: comments[key].uid });
        }
        const mainComments = comments.filter(x=>x.replyto===0);
        const mainCommentLength = mainComments.length;
        const subComments = comments.filter(x=>x.replyto!==0);
        let commentTree = [];
        for (const comment of mainComments) {
            let ids = [comment.cid];
            let replies = []
            while (ids.length > 0) {
                let cid = ids.pop();
                let comments = subComments.filter(x=>x.replyto===cid);
                replies = replies.concat(comments); 
                if (comments.length > 0) {
                    ids = ids.concat(comments.map(x=>x.cid));
                }
            }
            comment.replies = replies;
            commentTree.push(comment);
        }
        commentTree = commentTree.slice(page*per_page, page*per_page + per_page);
        return {
            count: mainCommentLength,
            commentTree: commentTree
        }
    }

    async getByUser(uid, page, per_page) {
        const comments = await this.app.mysql.select('comment', {
            where: { uid: uid, isdelete: 0 },
            orders: [['cid','desc']],
            limit: per_page,
            offset: page * per_page
        });
        return comments
    }

    async post(uid, sid, comment) {
        const result = await this.app.mysql.insert('comment', { 
            uid: uid,
            sid: sid,
            content: comment,
        });
        if (result.affectedRows === 1) {
            return result.insertId;
        } else {
            return -1;
        }
    }

    async reply(uid, sid, cid, comment) {
        const result = await this.app.mysql.insert('comment', { 
            uid: uid,
            sid: sid,
            replyto: cid,
            content: comment,
        });
        if (result.affectedRows === 1) {
            return result.insertId;
        } else {
            return -1;
        }
    }

    async like(uid, sid, cid, type, like) {
        if (like) {
            let result;
            if (type === 1) {
                result = await this.app.mysql.query('update comment set sup = sup + 1 where cid = ?', [cid]);
            } else {
                result = await this.app.mysql.query('update comment set sup = sup - 1 where cid = ?', [cid]);
            }
            return result.affectedRows === 1;
        } else {
            let result;
            if (type === 1) {
                result = await this.app.mysql.query('update comment set sdown = sdown + 1 where cid = ?', [cid]);
            } else {
                result = await this.app.mysql.query('update comment set sdown = sdown - 1 where cid = ?', [cid]);
            }
            return result.affectedRows === 1;
        }
        
    }

    async putByID(uid, sid, cid, comment) {
        const row = {
            content: comment,
        };
        const options = {
            where: {
                cid: cid,
                uid: uid,
            }
        };
        const result = await this.app.mysql.update('comment', row, options);
        return result.affectedRows === 1;
    }

    async deleteByID(uid, sid, cid) {
        const row = {
            isdelete: 1,
        };
        const options = {
            where: {
                cid: cid,
                uid: uid,
            }
        };
        const result = await this.app.mysql.update('comment', row, options);
        return result.affectedRows === 1;
    }
}

module.exports = CommentService;
