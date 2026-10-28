const { port } = require('./config');
const { createApp } = require('./app');

const dev = process.argv.includes('--dev');

createApp({ dev }).then((app) => {
  app.listen(port, () => {
    console.log(`North End College running at http://localhost:${port}${dev ? ' (development, live reload)' : ''}`);
  });
});
