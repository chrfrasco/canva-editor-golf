module.exports = {
  new() {
    let id = 0;
    return {
      next() {
        return `${id++}`;
      },
    };
  },
};
