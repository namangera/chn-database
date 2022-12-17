// const { request, response } = require('./app')

console.log({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT}
  );

const { Pool, Client } = require('pg')
const pool = new Pool({
  user: process.env.DB_USER,//'postgres',
  host: process.env.DB_HOST,//'localhost',
  database: process.env.DB_NAME,//'chn',
  password: process.env.DB_PASS,//'sherbrooke',
  port: process.env.DB_PORT,//5432,
})

const client = new Client({
  user: process.env.DB_USER,//'postgres',
  host: process.env.DB_HOST,//'localhost',
  database: process.env.DB_NAME,//'chn',
  password: process.env.DB_PASS,//'sherbrooke',
  port: process.env.DB_PORT,//5432,
})
client.connect()

module.exports = {
  // getCatchment,
  // getID,
  // getID2,
  // query: (text, params) => 
  //    pool.query(text, params)
  // ,
  query: (text, params) => 
     pool.query(text, params),
  // session:(text,params,callback) =>{
  //   return session.run(text,params,callback)
  // },
}

// const neo4j = require('neo4j-driver')
// const driver = new neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "sherbrooke"));
// const session = driver.session();

// const cypher = 'MATCH (n) RETURN count(n) as count';

// const upstream = 'MATCH(s:Segment) WHERE s.NodeID = $nodeid OPTIONAL MATCH (s)-[d:upstream*]->(n) WITH s+COLLECT(DISTINCT n) AS v UNWIND v as a RETURN DISTINCT a.NodeID as NodeID';
// const params = { nodeid: '600a1565-ac79-409e-b0e9-bcdc034306ab' };
// session.run(upstream, params)
//     .then(result => {
//         return result.records.map(record =>{
//           console.log(record.get("NodeID"));
//         });
//     })
//     .catch(e => {
//         // Output the error
//         console.log(e);
//     })
//     .then(() => {
//         // Close the Session
//         return session.close();
//     })
//     .then(() => {
//         // Close the Driver
//         return driver.close();
//     });


// const downstream = 'MATCH(s:Segment) WHERE s.NodeID = $nodeid OPTIONAL MATCH (s)-[d:downstream*]->(p) WITH s+COLLECT(DISTINCT p) AS v UNWIND v as a RETURN a.NodeID as NodeID'
// session.run(downstream, params)
//       .then(result => {
//         // On result, get count from first record
//         // const count = result.records[0].get('NodeID');
//         // Log response
//         // console.log( count.toNumber() );
//         return result.records.map(record =>{
//           console.log(record.get("NodeID"));
//         });
//       })
//       .catch(e => {
//         // Output the error
//         console.log(e);
//       })
//       .then(() => {
//         // Close the Session
//         return session.close();
//       })
//       .then(() => {
//         // Close the Driver
//         return driver.close();
//       });



// const getCatchment = (request, response) => {
//     pool.query('Select * from nhd_flow_catchment LIMIT 100', (error, results) => {
//       if (error) {
//         throw error
//       }
//       response.status(200).json(results.rows)
//     })
//   }


// var textQ = 'SELECT flow.geom, flow.nhdplusid FROM nhd_flow_catchment as catch, nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) AND ST_Contains(catch.geom, ST_Point(-71.589712, 45.142732, 4269)::geometry);'

// const getID = (request, response) => {

//   pool.query('SELECT flow.geom, flow.nhdplusid FROM nhd_flow_catchment as catch, nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) AND ST_Contains(catch.geom, ST_Point(-71.589712, 45.142732, 4269)::geometry);',
//    (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// }

// var textQ2 = 'SELECT flow.geom, flow.nhdplusid FROM nhd_flow_catchment as catch, nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) AND ST_Contains(catch.geom, ST_Point(-71.589712, 45.142732, $1)::geometry);'
// const getID2 = (request, response,next) => {
//   // const cordx = request.params.cordx
//   // console.log(cordx);
//   // cordx = 4269;
//   pool.query('SELECT flow.geom, flow.nhdplusid FROM nhd_flow_catchment as catch, nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) AND ST_Contains(catch.geom, ST_Point(-71.589712, 45.1732, $1)::geometry);',[request.params.cordx],
//    (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// }

