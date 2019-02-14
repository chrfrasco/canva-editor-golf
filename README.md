# submission for 19

You could try to get the bundle size down, but what about shipping no Javascript at all? :big-think:

```shell
$ wc -c static/bundle.js
wc: dist/bundle.js: open: No such file or directory
```

Wow that's small!

**_Zero dependencies_** (bar the node http & url libraries) and zero javascript shipped to the user.

## features

- 😡 Add images to the canvas
  - coming soon (???)
  - post form data, b64 encode buffer & stick in a data url
- ✅ Add text to the canvas
- ✅ Drag/move elements on the canvas - no dragging tho
- ✅ Save the canvas as an image file - save as PDF

## dev

```shell
$ yarn start
```

## build & run

```shell
$ yarn build && node dist/index.js
```

## check size

```fish
$ yarn build && wc -c dist/index.js
  ...
  14992 dist/index.js
```

or... (sans `node_modules`, `dist/` and `yarn.lock`)

```shell
$ find . -type f -exec grep -Iq . {} \; -and -print | xargs cat | wc -c
  70049
```
