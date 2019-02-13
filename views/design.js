const base = require('./base');

const template = body =>
  base.template({
    head: `<style>
    .canvas {
      width: 750px;
      height: 350px;
      border: thin dotted grey;
    }
    .circle {
      border-radius: 100%;
    }
  </style>`,
    body,
  });

module.exports = { template };
