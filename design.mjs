import idGenerator from './id_generator';

const payloadify = obj => encodeURIComponent(JSON.stringify(obj));

const Style = {
  for(element) {
    return Style._toString(Style._for(element));
  },
  _for(element) {
    switch (element.type) {
      case 'circle':
        return {
          ...Style._position(element.attrs.x, element.attrs.y, element.attrs.rotation),
          width: element.attrs.radius * 2,
          height: element.attrs.radius * 2,
          ['background-color']: element.attrs.color,
        };
      case 'rect':
        return {
          ...Style._position(element.attrs.x, element.attrs.y, element.attrs.rotation),
          width: element.attrs.width,
          height: element.attrs.height,
          ['background-color']: element.attrs.color,
        };
      case 'text':
        return {
          ...Style._position(element.attrs.x, element.attrs.y, element.attrs.rotation),
          width: element.attrs.width,
          height: element.attrs.height,
        };
      default:
        throw new Error(`unrecognized element type "${element.type}"`);
    }
  },
  _position(x, y, rotation) {
    return { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)` };
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
    const payload = payloadify({ id: element.id });
    return `
      <div class="element__controls">
        <button class="button button--block">
          <a class="element__control" href="?action_type=show_edit&action_payload=${payload}">Edit</a>
        </button>
        <button class="button button--block">
          <a class="element__control" href="?action_type=delete_element&action_payload=${payload}">Delete</a>
        </button>
      </div>
    `;
  },
};

const Element = {
  _idGenerator: idGenerator.new(),
  new(type) {
    switch (type) {
      case 'circle':
        return Element.circle();
      case 'rect':
        return Element.rect();
      case 'text':
        return Element.text();
      default:
        throw new Error(`unrecognized element type "${type}"`);
    }
  },
  update(element, attrs) {
    return {
      ...element,
      attrs: {
        ...element.attrs,
        ...attrs,
      },
    };
  },
  _commonAttrs: {
    x: 0,
    y: 0,
    rotation: 0,
  },
  circle() {
    return {
      id: Element._idGenerator.next(),
      type: 'circle',
      attrs: {
        ...Element._commonAttrs,
        color: 'red',
        radius: 100,
      },
    };
  },
  rect() {
    return {
      id: Element._idGenerator.next(),
      type: 'rect',
      attrs: {
        ...Element._commonAttrs,
        color: 'blue',
        width: 200,
        height: 75,
      },
    };
  },
  text() {
    return {
      id: Element._idGenerator.next(),
      type: 'text',
      attrs: {
        ...Element._commonAttrs,
        width: 100,
        height: 40,
        text: 'Hover over to start editing',
      },
    };
  },
  render(element) {
    switch (element.type) {
      case 'circle':
        return `
          <div class="element circle" id="a${element.id}">
            ${ElementControls.render(element)}
          </div>
        `;
      case 'rect':
        return `
          <div class="element rect" id="a${element.id}">
            ${ElementControls.render(element)}
          </div>
        `;
      case 'text':
        return `
          <div class="element text" id="a${element.id}">
            <p style="margin: 0;">
              ${element.attrs.text}
            </p>
            ${ElementControls.render(element)}
          </div>
        `;
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

const AttributeControl = {
  render(name, value) {
    return `
      <label class="attr__label">
        ${name}
        ${AttributeControl._render(name, value)}
      </label>
    `;
  },
  _render(name, value) {
    switch (typeof value) {
      case 'number':
        return `<input type="number" name="action_payload.${name}" value="${value}">`;
      case 'string':
        return `<input type="text" name="action_payload.${name}" value="${value}">`;
      default:
        throw new Error(`unrecognized attribute type "${typeof value}"`);
    }
  },
};

const AttributeControls = {
  render(attrs) {
    return Object.entries(attrs)
      .map(([name, value]) => AttributeControl.render(name, value))
      .join('\n');
  },
};

const EditPanel = {
  render(design) {
    const elementId = design.editing;
    const element = design.elements.find(el => el.id === elementId);
    switch (element.type) {
      case 'circle':
      case 'rect':
      case 'text':
        return `<form method="GET" action="/design/${design.id}">
          <h2>editing a ${element.type} with id ${element.id}</h2>
          <input hidden type="text" name="action_type" value="update_element">
          <input hidden type="text" name="action_payload.id" value="${element.id}">
          ${AttributeControls.render(element.attrs)}
          <button type="submit">Update</button>
        <form>`;
      default:
        throw new Error(`unrecognized element type "${element.type}"`);
    }
  },
};

const ElementAttrs = {
  santise(attrs) {
    return Object.entries(attrs)
      .map(([key, value]) => {
        if (/^[0-9]+$/.test(value) && key !== 'id') {
          return [key, parseInt(value, 10)];
        }

        return [key, value];
      })
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
  },
};

const UpdateAnimation = {
  for(prevElement, nextElement) {
    return `{
      from {
        ${Style.for(prevElement)}
      }
      to {
        ${Style.for(nextElement)}
      }
    }`;
  },
};

export const Design = {
  _idGenerator: idGenerator.new(),
  new() {
    return {
      id: Design._idGenerator.next(),
      elements: [Element.circle()],
    };
  },
  render(design, action) {
    const updatedDesign = Design.update(design, action);
    const html = `
      ${updatedDesign.elements
        .map(element => {
          if (action && action.type === 'update_element' && element.id === action.payload.id) {
            const oldElement = design.elements.find(el => el.id === action.payload.id);
            return `<style>
              @keyframes enter ${UpdateAnimation.for(oldElement, element)}
              #a${element.id} {
                ${Style.for(element)};
                animation-name: enter;
                animation-duration: 0.5s;
                animation-iteration-count: 1;
              }
            </style>`;
          }

          return `<style>#a${element.id} {${Style.for(element)}}</style>`;
        })
        .join('')}
      <div class="canvas">
        ${Elements.render(updatedDesign.elements)}
      </div>
      <div>
        <a href="/design/${updatedDesign.id}?action_type=add_element&action_payload=${payloadify({ type: 'circle' })}">
          Create a circle
        </a>
        <a href="/design/${updatedDesign.id}?action_type=add_element&action_payload=${payloadify({ type: 'rect' })}">
          Create a rectangle
        </a>
        <a href="/design/${updatedDesign.id}?action_type=add_element&action_payload=${payloadify({ type: 'text' })}">
          Create a text box
        </a>
      </div>
      ${updatedDesign.editing ? EditPanel.render(updatedDesign) : ''}
    `;
    return { html, design: updatedDesign };
  },
  update(design, action) {
    if (action == null) {
      return design;
    }

    switch (action.type) {
      case 'show_edit': {
        const element = design.elements.find(element => element.id === action.payload.id);
        return { ...design, editing: element.id };
      }
      case 'hide_edit': {
        return { ...design, editing: undefined };
      }
      case 'delete_element': {
        return {
          ...design,
          elements: design.elements.filter(element => element.id !== action.payload.id),
          editing: design.editing && (design.editing === action.payload.id ? undefined : design.editing.id),
        };
      }
      case 'add_element': {
        return {
          ...design,
          elements: [...design.elements, Element.new(action.payload.type)],
        };
      }
      case 'update_element': {
        const { id, ...rawAttrs } = action.payload;
        const attrs = ElementAttrs.santise(rawAttrs);

        const elements = design.elements.map(element => (element.id === id ? Element.update(element, attrs) : element));

        return { ...design, elements };
      }
      default:
        return design;
    }
  },
};
