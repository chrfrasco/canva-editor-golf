const template = ({ body = '', head = '' } = {}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <style>
      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      html,
      body {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      }
    </style>
    <title>Canva New Millenium</title>
    ${head}
  </head>
  <body>
    ${body}
  </body>
</html>`;

module.exports = { template };
