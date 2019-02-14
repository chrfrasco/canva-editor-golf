# submission for 19

You could try to get the bundle size down, but what about shipping no Javascript at all? :big-think:

```shell
$ wc -c static/bundle.js
wc: dist/bundle.js: open: No such file or directory
```

Wow that's small!

Zero dependencies (bar the node http & url libraries) and zero javascript shipped to the user.

## TODO

- [ ] add images to canvas
- [x] render to image (????????)

## dev

```shell
$ yarn start
```

## build & run

```shell
$ yarn build && node dist/index.js
```

## check size

```shell
$ wc -c dist/index.js
```
