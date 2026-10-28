const { port } = require('./config');
const app = require('./app');

app.listen(port, () => {
  console.log(`North End College running at http://localhost:${port}`);
});
