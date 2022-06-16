'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // router.get('/', controller.home.index);
  /**
   * @feature user
   */
  router.post('/api/v1/login', controller.user.login);
  router.post('/api/v1/loginadmintest', controller.user.logintest);
  router.post('/api/v1/logout', controller.user.logout);
  router.post('/api/v1/authorization', controller.user.authorization);
  router.post('/api/v1/accesstoken', controller.user.accessToken);
  router.post('/api/v1/checktoken', controller.user.checkToken);
  /**
   * @feature datasets
   */
  router.post('/api/v1/datasets', controller.dataset.post);
  router.get('/api/v1/datasets', controller.dataset.get);
  router.get('/api/v1/datasets/:did', controller.dataset.getByID);
  router.put('/api/v1/datasets/:did', controller.dataset.putByID);
  router.get('/api/v1/users/:uid/datasets', controller.dataset.getByUser);
  router.delete('/api/v1/datasets/:did', controller.dataset.deleteByID);
  /**
   * @feature stories
   */
  router.post('/api/v1/stories', controller.story.post);
  router.get('/api/v1/stories', controller.story.get);
  router.get('/api/v1/stories/:sid', controller.story.getByID);
  router.get('/api/v1/users/:uid/stories', controller.story.getByUser);
  router.get('/api/v1/datasets/:did/stories', controller.story.getByData);
  router.get('/api/v1/stories/:sid/sharelink', controller.story.share);
  router.get('/api/v1/public/:uuid', controller.story.public);
  router.put('/api/v1/stories/:sid', controller.story.putByID);
  router.get('/api/v1/stories/:sid/rating', controller.story.getRating);
  router.post('/api/v1/stories/:sid/rating', controller.story.rating);
  router.post('/api/v1/stories/:sid/view', controller.story.view);
  router.delete('/api/v1/stories/:sid', controller.story.deleteByID);
  /**
   * @feature comments
   */
  router.post('/api/v1/stories/:sid/comments', controller.comment.post);
  router.get('/api/v1/stories/:sid/comments', controller.comment.getByStory);
  router.get('/api/v1/users/:uid/comments', controller.comment.getByUser);
  router.put('/api/v1/stories/:sid/comments/:cid', controller.comment.putByID);
  router.post('/api/v1/stories/:sid/comments/:cid/replies', controller.comment.reply);
  router.post('/api/v1/stories/:sid/comments/:cid/likes', controller.comment.like);
  router.delete('/api/v1/stories/:sid/comments/:cid', controller.comment.deleteByID);
};
