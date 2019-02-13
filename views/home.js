const base = require('./base');

const template = () =>
  base.template({
    body: '<a href="/design/new">Create a design</a>',
  });

module.exports = { template };
