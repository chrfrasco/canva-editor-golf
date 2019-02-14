import base from './base';

const template = body =>
  base.template({
    head: `<style>
    .canvas {
      border: thin dotted grey;
      position: relative;
      overflow: hidden;
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
    .attr__label {
      display: block;
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

export default { template };
