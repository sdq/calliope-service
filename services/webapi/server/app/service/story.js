'use strict';

const { v4: uuidv4 } = require('uuid');
const Service = require('egg').Service;

class StoryService extends Service {
    async post(uid, did, title, description, json) {
        const result = await this.app.mysql.insert('story', { 
            uid: uid,
            did: did,
            title: title,
            description: description,
            json: json,
        });
        if (result.affectedRows === 1) {
            await this.app.mysql.query('update dataset set num_of_visualized = num_of_visualized + 1 where did = ?', [did]);
            // delete cache for first story page
            const cachepages = [2,3,4,5,6,10,15,20,25];
            for (const cachepage of cachepages) {
                let key = "story:" + 0 + ":" + cachepage + "::time";
                await this.service.cache.delete(key);
            }
            return result.insertId;
        } else {
            return -1;
        }
    }

    async get(page, per_page, keywords, sort) {
        let key = "story:" + page + ":" + per_page + ":" + keywords + ":" + sort;
        let cacheResult = await this.service.cache.get(key);
        if (cacheResult) {
            return cacheResult;
        }
        let stories = [];
        let total = {};
        if (keywords !== "") {
            let searchResult = await this.service.search.story(keywords, page, per_page, sort);
            stories = searchResult.stories;
            total = searchResult.total;
        } else {
            let orders = [['time','desc']];
            if (sort === 'rate') {
                orders = [['rating','desc']]
            }
            stories = await this.app.mysql.select('story', {
                where: { isdelete: 0 },
                orders: orders,
                limit: per_page,
                offset: page * per_page
            });
        }
        stories.map(s => {
            s.rating = s.rating/s.num_of_rates;
            return s
        });
        for (const key in stories) {
            stories[key].user = await this.app.mysql.get('user', { uid: stories[key].uid });
            // stories[key].dataset = await this.app.mysql.get('dataset', { uid: stories[key].did });
        }
        const getResult = {
            total: total,
            stories: stories
        };
        await this.service.cache.set(key, getResult, 60);
        return getResult;
    }

    async getByID(sid) {
        // let key = "story:" + sid;
        // let cacheResult = await this.service.cache.get(key);
        // if (cacheResult) {
        //     return cacheResult;
        // }
        const story = await this.app.mysql.get('story', { sid: sid });
        if (story === null || story === undefined) {
            return {}
        }
        story.rating = story.rating/story.num_of_rates;
        story.user = await this.app.mysql.get('user', { uid: story.uid });
        story.dataset = await this.app.mysql.get('dataset', { did: story.did });
        const getResult = {story};
        // await this.service.cache.set(key, getResult, 60);
        return getResult;
    }

    async getByUser(uid, page, per_page) {
        // let key = "user:" + uid + ":story:" + page + ":" + per_page;
        // let cacheResult = await this.service.cache.get(key);
        // if (cacheResult) {
        //     return cacheResult;
        // }
        const stories = await this.app.mysql.select('story', {
            where: { uid: uid, isdelete: 0 },
            orders: [['sid','desc']],
            limit: per_page,
            offset: page * per_page
        });
        stories.map(s => {
            s.rating = s.rating/s.num_of_rates;
            return s
        });
        // for (const key in stories) {
        //     stories[key].dataset = await this.app.mysql.get('dataset', { uid: stories[key].did });
        // }
        const user = await this.app.mysql.get('user', { uid: uid });
        for (const key in stories) {
            stories[key].user = user;
        }
        const getResult = stories;
        // await this.service.cache.set(key, getResult, 60);
        return getResult;
    }

    async getByData(did, page, per_page) {
        let key = "dataset:" + did + ":story:" + page + ":" + per_page;
        let cacheResult = await this.service.cache.get(key);
        if (cacheResult) {
            return cacheResult;
        }
        const stories = await this.app.mysql.select('story', {
            where: { did: did, isdelete: 0 },
            orders: [['sid','desc']],
            limit: per_page,
            offset: page * per_page
        });
        stories.map(s => {
            s.rating = s.rating/s.num_of_rates;
            return s
        });
        for (const key in stories) {
            stories[key].user = await this.app.mysql.get('user', { uid: stories[key].uid });
        }
        const getResult = stories;
        await this.service.cache.set(key, getResult, 60);
        return getResult;
    }

    async share(uid, sid) {
        const story = await this.app.mysql.get('story', { sid: sid });
        const uuid = uuidv4();
        const result = await this.app.mysql.insert('share', { 
            uid: uid,
            sid: sid,
            json: story.json,
            uuid: uuid,
        });
        if (result.affectedRows === 1) {
            await this.app.mysql.query('update story set num_of_shares = num_of_shares + 1 where sid = ?', [sid]);
            return "/publish/" + uuid;
        } else {
            return "";
        }
    }

    async public(uuid) {
        let key = "public:" + uuid;
        let cacheResult = await this.service.cache.get(key);
        if (cacheResult) {
            return cacheResult;
        }
        const sharedstory = await this.app.mysql.get('share', { uuid: uuid });
        if (sharedstory) {
            sharedstory.user = await this.app.mysql.get('user', { uid: sharedstory.uid });
        }
        const getResult = sharedstory;
        await this.service.cache.set(key, getResult, 120);
        return getResult;
    }

    async view(sid) {
        let result = await this.app.mysql.query('update story set num_of_views = num_of_views + 1  where sid = ?', [sid]);
        return result.affectedRows === 1;
    }

    async rating(uid, sid, rate) {
        const story = await this.app.mysql.get('story', { sid: sid });
        const ratecount = await this.app.mysql.query('select count(rating) from rate where sid = ? and uid = ?', [sid, uid]);
        const is_rated = ratecount[0]['count(rating)'] === 1;
        let result1, result2;
        if (is_rated) {
            // update rating
            const user_rate = await this.app.mysql.get('rate', { sid: sid, uid: uid });
            const oldRating = user_rate.rating;
            let newRating = story.rating + rate - oldRating;
            result1 = await this.app.mysql.query('update rate set rating = ? where sid = ? and uid = ?', [rate, sid, uid]);
            result2 = await this.app.mysql.query('update story set rating = ?  where sid = ?', [newRating, sid]);
            return result1.affectedRows === 1 && result2.affectedRows === 1;
        } else {
            // create new rating
            result1 = await this.app.mysql.insert('rate', { 
                uid: uid,
                sid: sid,
                rating: rate,
            });
            let newRating = story.rating + rate;
            result2 = await this.app.mysql.query('update story set num_of_rates = num_of_rates + 1, rating = ?  where sid = ?', [newRating, sid]);
            return result1.affectedRows === 1 && result2.affectedRows === 1;
        }
    }

    async getRating(sid, uid) {
        const user_rate = await this.app.mysql.get('rate', { sid: sid, uid: uid });
        return user_rate;
    }

    async putByID(uid, sid, title, description, json) {
        const row = {
            title: title,
            description: description,
            json: json,
        };
        const options = {
            where: {
                sid: sid,
                uid: uid,
            }
        };
        const result = await this.app.mysql.update('story', row, options);
        return result.affectedRows === 1;
    }

    async deleteByID(uid, sid) {
        const row = {
            isdelete: 1,
        };
        const options = {
            where: {
                sid: sid,
                uid: uid,
            }
        };
        const result = await this.app.mysql.update('story', row, options);
        return result.affectedRows === 1;
    }
}

module.exports = StoryService;