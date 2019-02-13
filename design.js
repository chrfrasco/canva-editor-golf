// @ts-check
const idGenerator = require('./id_generator');

const Style = {
  for(element) {
    return Style._toString(Style._for(element));
  },
  _for(element) {
    switch (element.type) {
      case 'circle':
        return {
          width: element.attrs.radius * 2,
          height: element.attrs.radius * 2,
          top: element.attrs.y,
          left: element.attrs.x,
          ['background-color']: element.attrs.color,
        };
      default:
        throw new Error(`unrecognized element type "${element.type}"`);
    }
  },
  _toString(style) {
    return Object.entries(style).reduce(
      (styleString, [prop, value]) => `${styleString}${prop}: ${typeof value === 'number' ? `${value}px` : value};`,
      '',
    );
  },
};

const ElementControls = {
  render(element) {
    const payload = JSON.stringify({ id: element.id });
    return `
      <div class="element__controls">
        <button class="button button--block">
          <a class="element__control" href="?action_type=show_edit&action_payload=${encodeURIComponent(
            payload,
          )}">Edit</a>
        </button>
        <button class="button button--block">
          <a class="element__control" href="?action_type=delete_element&action_payload=${encodeURIComponent(
            payload,
          )}">Delete</a>
        </button>
      </div>
    `;
  },
};

const Element = {
  _idGenerator: idGenerator.new(),
  circle() {
    return {
      id: Element._idGenerator.next(),
      type: 'circle',
      attrs: {
        x: 0,
        y: 0,
        color: 'red',
        radius: 100,
      },
    };
  },
  render(element) {
    switch (element.type) {
      case 'circle': {
        return `
          <div class="element circle" style="${Style.for(element)}">
            ${ElementControls.render(element)}
          </div>
        `;
      }
      default:
        throw new Error(`unrecognized element type "${element.type}"`);
    }
  },
};

const Elements = {
  render(elements) {
    return elements.map(Element.render).join('\n');
  },
};

const EditPanel = {
  render(design) {
    const element = design.editing;
    switch (element.type) {
      case 'circle':
        return `editing a circle with id ${element.id}`;
      default:
        throw new Error(`unrecognized element type "${element.type}"`);
    }
  },
};

const Design = {
  _idGenerator: idGenerator.new(),
  new() {
    return {
      id: Design._idGenerator.next(),
      elements: [Element.circle()],
    };
  },
  render(design) {
    return `
      <div class="canvas">
        ${Elements.render(design.elements)}
      </div>
      ${design.editing ? EditPanel.render(design) : ''}
    `;
  },
  update(design, action) {
    if (action == null) {
      return design;
    }

    switch (action.type) {
      case 'show_edit': {
        const element = design.elements.find(element => element.id === action.payload.id);
        return { ...design, editing: element };
      }
      case 'hide_edit': {
        return { ...design, editing: undefined };
      }
      case 'delete_element': {
        return {
          ...design,
          elements: design.elements.filter(element => element.id !== action.payload.id),
          editing: design.editing && (design.editing.id === action.payload.id ? undefined : design.editing.id),
        };
      }
      default:
        return design;
    }
  },
};

module.exports = { Design };
