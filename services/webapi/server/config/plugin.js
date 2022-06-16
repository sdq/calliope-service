'use strict';

/** @type Egg.EggPlugin */

exports.validate = {
  enable: true,
  package: 'egg-validate',
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
};

exports.session = true;

exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};

exports.redis = {
  enable: true,
  package: 'egg-redis',
};
