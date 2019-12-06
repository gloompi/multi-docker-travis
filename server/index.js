const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const redis = require('redis');
const { Pool } = require('pg');

const keys = require('./keys');

// app init
const app = express();
app.use(cors());
app.use(bodyParser.json());

// postgresQL
const pgClient = new Pool({
  user: keys.pgUser,
  password: keys.pgPassword,
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDatabase,
});

pgClient.on('error', () => {
  console.log('Lost PG connection');
});

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));

// redis
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

redisClient.on("error", (err) => {
  console.log("Error " + err);
});

const redisPublisher = redisClient.duplicate();

// route handlers
app.get('/', (_req, res) => {
  res.send('HI!');
});

app.get('/values/all', async (_req, res) => {
  const values = await pgClient.query('SELECT * FROM values');

  res.send(values.rows);
});

app.get('/values/current', async (_req, res) => {
  redisClient.hgetall('values', (_err, values) => {
    console.log('CHECK', _err, values);
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hmset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, _err => {
  console.log('Listening');
})
