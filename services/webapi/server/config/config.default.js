/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + 'xxx';

  // add your middleware config here
  config.middleware = [ 'notfoundHandler' ];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  exports.security = {
    csrf: false,
    ctoken: false,
  };

  exports.cors = {
    // origin: '*',
    origin: 'https://datacalliope.com',
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };

  exports.mysql = {
    // database configuration
    client: {
      host: 'mysql',
      port: '3306',
      // host: 'localhost',
      // port: '6000',
      user: 'password',
      password: 'password',
      database: 'calliope',
    },
    // load into app, default true
    app: true,
    // load into agent, default false
    agent: false,
  };

  config.redis = {
    client: {
      port: 6379,
      host: 'redis',
      // port: 6001,
      // host: 'localhost',
      password: 'password',
      db: 0,
    },
  }

  return {
    ...config,
    ...userConfig,
  };
};
