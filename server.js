const express = require('express');
const connectDB = require('./config/db');
const app = express();
const path = require('path');
//connect DB
connectDB();

//Init middlewares
app.use(express.json({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-control-Allow-Origin', '*');
  res.setHeader('Access-control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', (req, res) => {
  console.log('got req /');
  res.send('hello');
});



//Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))

//serve static assests in prod
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started ${PORT} `)); 
