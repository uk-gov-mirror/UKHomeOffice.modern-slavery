'use strict';

let redis = require('../../../redis');

/**
 * Get data source object
 *
 * If data source not supplied then we will use the default redis object
 *
 * @param {object} [dataSource=redis] - the supplied data source
 */
const setDataSource = (dataSource = redis) => {
  redis = dataSource;
 };

/**
 * Read token from redis
 *
 * @param {string} token - token used to verify user
 */
const read = async(token) => {
  const user = {};
  user.valid = await redis.get(`token:${token}`);
  user.email = await redis.get(`${token}:email`);
  user.organisation = await redis.get(`${token}:organisation`);
  return user;
};

/**
 * Remove token from redis
 *
 * @param {string} token - token used to verify user
 */
const remove = (token) => {
  redis.del(`token:${token}`);
};

module.exports = {
 // check the token is in redis
 // catch is dealt with later by whatever calls this promise
 read,
 delete: remove,
 setDataSource,
};
