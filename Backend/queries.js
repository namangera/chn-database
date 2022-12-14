const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'naman',
  host: 'localhost',
  database: 'NHD',
  password: 'sherbrooke',
  port: 5432,
})

const client = new Client({
  user: 'naman',
  host: 'localhost',
  database: 'NHD',
  password: 'sherbrooke',
  port: 5432,
})
client.connect()

module.exports = {
  query: (text, params) => 
     pool.query(text, params),
}

