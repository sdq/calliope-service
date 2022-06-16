'use strict';

const { Client } = require('@elastic/elasticsearch')
const searchclient = new Client({ node: 'http://elasticsearch:9200' })
// const searchclient = new Client({ node: 'http://localhost:6002' })
const Service = require('egg').Service;

class SearchService extends Service {
    async story(words, page, per_page, sort) {
        const wordlist = words.split(" ");
        let shouldArray = [
            { match_phrase_prefix: { 
                title: {
                    query: words,
                    slop: 3,
                }
            }},
            { match_phrase_prefix: { 
                description: {
                    query: words,
                    slop: 3,
                }
            }}
        ];
        for (const word of wordlist) {
            shouldArray.push({ fuzzy: { title: word }});
            shouldArray.push({ fuzzy: { description: word }});
        }
        const result = await searchclient.search({
            index: 'story',
            body: {
                query: {
                    bool: {
                        must : {
                            term : { isdelete : 0 }
                        },
                        should: shouldArray,
                        minimum_should_match: 1
                    }
                },
                from: page * per_page,
                size: per_page
            }
        });
        const hits = result.body.hits.hits;
        const stories = hits.map(item => {
            let story = item._source;
            story.search_score = item._score;
            return story;
        });
        const total = result.body.hits.total;
        return {
            total: total,
            stories: stories,
        }
    }

    async dataset(words, page, per_page, sort) {
        const result = await searchclient.search({
            index: 'dataset',
            body: {
                query: {
                    bool: {
                        must : {
                            term : { isdelete : 0 }
                        },
                        should: [
                            { fuzzy: { data: words }},
                            { fuzzy: { keywords: words }},
                            { match_phrase_prefix: { 
                                data: {
                                    query: words,
                                    slop: 3,
                                }
                            }},
                            { match_phrase_prefix: { 
                                keywords: {
                                    query: words,
                                    slop: 3,
                                }
                            }},
                        ],
                        minimum_should_match: 1
                    }
                },
                from: page * per_page,
                size: per_page
            }
        });
        const hits = result.body.hits.hits;
        const datasets = hits.map(item => {
            let dataset = item._source;
            dataset.search_score = item._score;
            return dataset;
        });
        const total = result.body.hits.total;
        return {
            total: total,
            datasets: datasets,
        }
    }
    
}

module.exports = SearchService;