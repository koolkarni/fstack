const express = require('express');

const app = express();

app.get('/', (req, res) => {
  console.log('got req /');
  res.send('hello');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started ${PORT} `));
