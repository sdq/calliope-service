'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  /**
   * @feature activity
   */
  router.post('/log/v1/users/:uid/activities', controller.activity.post);
};
