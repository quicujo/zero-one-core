const library = require('@neutrinojs/library');

module.exports = {
  options: {
    root: __dirname,
    output: 'dist',
  },
  use: [
    library({
      name: '@z1/preset-feathers-server-sql',
      target: 'node',
    }),
  ],
};
