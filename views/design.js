const base = require('./base');

const template = body =>
  base.template({
    head: `<style>
    .canvas {
      width: 750px;
      height: 350px;
      border: thin dotted grey;
      position: relative;
    }
    .button {
      border: none;
      background: white;
      border-radius: 2px;
      color: black;
    }
    .button--block {
      display: block;
      margin: 1rem;
    }
    .element {
      position: absolute;
    }
    .circle {
      border-radius: 100%;
    }
    .element__controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      opacity: 0;
      transition: opacity 250ms ease-in-out;
    }
    .element__controls:hover {
      opacity: 1;
    }
    .element__control {
    }
  </style>`,
    body,
  });

module.exports = { template };
