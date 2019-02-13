const template = body => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <style>
      .canvas {
        width: 750px;
        height: 350px;
        border: thin dotted grey;
      }
      .circle {
        border-radius: 100%;
      }
    </style>
    <title>Canva New Millenium</title>
  </head>
  <body>
    ${body}
  </body>
</html>`;

module.exports = { template };
