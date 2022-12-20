// const { request, response } = require('./app')

// console.log({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT}
//   );

const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'naman',
  host: 'localhost',
  database: 'NHD',
  password: 'sherbrooke',
  port: 5432,
  // user: process.env.DB_USER,//'postgres',
  // host: process.env.DB_HOST,//'localhost',
  // database: process.env.DB_NAME,//'chn',
  // password: process.env.DB_PASS,//'sherbrooke',
  // port: process.env.DB_PORT,//5432,
})

const client = new Client({
  user: 'naman',
  host: 'localhost',
  database: 'NHD',
  password: 'sherbrooke',
  port: 5432,
  // user: process.env.DB_USER,//'postgres',
  // host: process.env.DB_HOST,//'localhost',
  // database: process.env.DB_NAME,//'chn',
  // password: process.env.DB_PASS,//'sherbrooke',
  // port: process.env.DB_PORT,//5432,
})
client.connect()

module.exports = {
  query: (text, params) => 
     pool.query(text, params),
}

