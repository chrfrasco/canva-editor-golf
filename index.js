// @ts-check
const express = require('express');
const { Design } = require('./design');
const views = require('./views');

const app = express();

const designs = new Map([['0', Design.new()]]);

app.use((request, response, next) => {
  if (request.query.action_type != null) {
    response.locals.action = {
      type: request.query.action_type,
      payload: request.query.action_payload ? JSON.parse(request.query.action_payload) : {},
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
  if (designId == null) {
    response.status(302).setHeader('Location', `/design/new`);
    return;
  }

  if (designs.has(designId)) {
    const design = Design.update(designs.get(designId), response.locals.action);
    designs.set(design.id, design);
    const renderedDesign = Design.render(design);

    response.send(views.design.template(renderedDesign));
    return;
  } else {
    response.status(404).send(views.notFound.template());
  }
});

app.listen(3030, () => {
  console.log('app listening on http://localhost:3030');
});
