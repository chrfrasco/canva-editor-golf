// @ts-check
const express = require('express');
const { Design } = require('./design');
const views = require('./views');

const app = express();

const designs = new Map([['0', Design.new()]]);

const parsePayload = query => {
  if (query.action_payload) {
    return JSON.parse(query.action_payload);
  }

  return Object.keys(query)
    .filter(key => key.startsWith('action_payload.'))
    .map(key => key.replace('action_payload.', ''))
    .reduce((acc, key) => {
      const value = query[`action_payload.${key}`];
      return { ...acc, [key]: value };
    }, {});
};

app.use((request, response, next) => {
  if (request.query.action_type != null) {
    response.locals.action = {
      type: request.query.action_type,
      payload: parsePayload(request.query),
    };
  }
  next();
});

app.get('/', (request, response) => {
  response.send(views.home.template());
});

app.get('/design/new', (request, response) => {
  const design = Design.new();
  designs.set(design.id, design);

  response.setHeader('Location', `/design/${design.id}`);
  response.status(302).send('');
});

app.get('/design/:designId', (request, response) => {
  const { designId } = request.params;

  if (designs.has(designId)) {
    const design = Design.update(designs.get(designId), response.locals.action);
    designs.set(design.id, design);
    const renderedDesign = Design.render(design);

    if (Object.keys(request.query).length !== 0) {
      response.setHeader('Location', `/design/${design.id}`);
      response.status(302);
    }

    response.send(views.design.template(renderedDesign));
    return;
  } else {
    response.status(404).send(views.notFound.template());
  }
});

app.listen(3030, () => {
  console.log('app listening on http://localhost:3030');
});
