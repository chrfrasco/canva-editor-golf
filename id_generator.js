const idGenerator = {
  new() {
    let id = 0;
    return {
      next() {
        return `${id++}`;
      },
    };
  },
};

export default idGenerator;
