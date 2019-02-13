const base = require('./base');

const template = () =>
  base.template({
    body: '<h1>Not found.</h1>',
  });

module.exports = { template };
