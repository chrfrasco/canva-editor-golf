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
        font-family: Arial, sans-serif;
      }

      input, textarea, select, button {
        font-family: inherit;
      }
    </style>
    <title>Canva SSR</title>
    ${head}
  </head>
  <body>
    ${body}
  </body>
</html>`;

export default { template };
