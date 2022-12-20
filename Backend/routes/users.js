const Router = require('express-promise-router')
const router = new Router()
const db = require('../queries')

module.exports = router;

// example of what request could look like
// http://localhost:3000/users/-71.334/-45.7282
// http://localhost:3000/users/neo2/-71.99755088522/45.22905067826488/4269
// main fucntion that return upstream drainage area
router.get('/neo2/:long/:lat/:projection', async(req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin", '*');
  var long = req.params.long;
  var lat = req.params.lat;
  // projection is hard coded because the geoview one does not work with this query
  // to set projection be read from geoview value use var projection = req.params.projection;
  var projection = '4269';
  // neo4j server connection
  const neo4j = require('neo4j-driver')
  const driver = new neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS));
  const session = driver.session();
  // testing cordinates 
  // (-71.89046076469687,45.405030523198704) is: 60000200097498  6.5 k
  // (-73.22047019604169,44.79920361747254) is: 60000200030736 14 k
  // (-71.88947085504539,45.406337987383104) is: 60000200097957 23 k
  // (-73.27204878598127,44.56466640458342) is: 60000200000130 27k

  // pg routing function to get NHDID for given cordinate
    var cords = [long, lat]
    var params = [long, lat, projection]
    // find geom from cord and projection query
    const neo1text = `
    SELECT flow.nhdplusid FROM nhd_flow_catchment as catch, 
    nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) 
    AND ST_Contains(catch.geom, ST_Point($1,$2, $3)::geometry);`
    console.log(params);
    var startTime = performance.now()
  try{
    await db.query('BEGIN')
    const resu = await db.query(neo1text, params)
    let geo = resu.rows[0].nhdplusid
    console.log('\n\nThe catchment NHDID associated to these coordinates:('+cords.toString()+ ') is: '+geo);

    await driver.verifyConnectivity()
    console.log('\nNEO4j Query starting. \nDriver created')
    const result = await session.readTransaction(tx =>
      tx.run(
        // upstream query
        // `MATCH(s:Segment) WHERE s.NodeID = $nodeid 
        // OPTIONAL MATCH (s)-[d:upstream*]->(n) RETURN DISTINCT n.NodeID as NodeID`
        `MATCH (s {NodeID: $nodeid})-[u:upstream*]->(b)
        WITH s, collect(b) AS v UNWIND v+s AS a
        RETURN DISTINCT a.NodeID`
        
        ,
        { nodeid: ''+geo } 
      )
    ) 
    var arr = []
    const d_area = result.records.map(row =>{
      arr.push(row.get(0))
    })
    console.log('\nNumber of catchment: '+arr.length);
    var ids = arr.toString();
    console.log('Drainage area found')
    
    await session.close()
    console.log('Session Closed')
    await driver.close()
    console.log('Driver Closed')
var endTime = performance.now()

console.log(`Call to catchment plus neo4j request took ${endTime - startTime} milliseconds`)

var startTime2 = performance.now()
    const q2=  `SELECT row_to_json(fc)
  FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Union(ARRAY(SELECT catch.geom FROM nhd_flow_catchment as catch 
WHERE nhdplusid in (`+ids+`))))::json As geometry, (select row_to_json(t) from (select 'name') t)As properties) As f )  As fc;`
    const{rows} = await db.query(q2)
    res.json(rows)
    console.log('\nJson returned');
    
  var endTime2 = performance.now()
  console.log(`Call to run build took ${endTime2 - startTime2} milliseconds`)
  }
  catch (e) {
    await db.query('ROLLBACK')
    throw e
  }finally {
  }
  })


  router.get('/downstream/:long/:lat/:projection', async(req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", '*');
    var long = req.params.long;
    var lat = req.params.lat;
    // projection is hard coded because the geoview one does not work with this query
    // to set projection be read from geoview value use var projection = req.params.projection;
    var projection = '4269';
    // neo4j server connection
    const neo4j = require('neo4j-driver')
    const driver = new neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "sherbrooke"));
    const session = driver.session();
    // pg routing function to get NHDID for given cordinate
      var cords = [long, lat]
      var params = [long, lat, projection]
      // find geom from cord and projection query
      const neo1text = `
      SELECT flow.nhdplusid FROM nhd_flow_catchment as catch, 
      nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) 
      AND ST_Contains(catch.geom, ST_Point($1,$2, $3)::geometry);`
      console.log(params);
      var startTime = performance.now()
    try{
      await db.query('BEGIN')
      const resu = await db.query(neo1text, params)
      let geo = resu.rows[0].nhdplusid
      console.log('\n\nThe Flowline NHDID associated to these coordinates:('+cords.toString()+ ') is: '+geo);
  
      await driver.verifyConnectivity()
      console.log('\nNEO4j Query starting. \nDriver created')
      const result = await session.readTransaction(tx =>
        tx.run(
          // Downstream query
          // `MATCH(s:Segment) WHERE s.NodeID = $nodeid 
          // OPTIONAL MATCH (s)-[d:downstream*]->(n) RETURN DISTINCT n.NodeID as NodeID`
          `MATCH (s {NodeID: $nodeid})-[d:downstream*]->(b)
          WITH s, collect(b) AS v UNWIND v+s AS a
          RETURN DISTINCT a.NodeID`
          ,
          { nodeid: ''+geo } 
        )
      ) 
      var arr = []
      const d_area = result.records.map(row =>{
        arr.push(row.get(0))
      })
      console.log('\nNumber of Flowpaths: '+arr.length);
      var ids = arr.toString();
      console.log('Downstream found')
      
      await session.close()
      console.log('Session Closed')
      await driver.close()
      console.log('Driver Closed')
  var endTime = performance.now()
  
  console.log(`Call to flowpath plus neo4j request took ${endTime - startTime} milliseconds`)
  
  var startTime2 = performance.now()
  //     const q2=  `SELECT row_to_json(fc)
  //   FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  //   FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Union(ARRAY(SELECT flow.geom FROM nhdflowlinejoined as flow 
  // WHERE nhdplusid in (`+ids+`))))::json As geometry, (select row_to_json(t) from (select 'name') t)As properties) As f )  As fc;`
  //     const{rows} = await db.query(q2)
  //     res.json(rows)
  const geom_return= 
     `SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
        )
    FROM (SELECT ST_UNION(ARRAY(SELECT DISTINCT flow.geom FROM nhdflowlinejoined as flow
	WHERE nhdplusid in (`+ids+`))))
          as t(geom);`
      const{rows} = await db.query(geom_return)
      var poly = rows[0].json_build_object
      res.json(poly)
      console.log('\nJson returned');
      
    var endTime2 = performance.now()
    console.log(`Call to run build took ${endTime2 - startTime2} milliseconds`)
    }
    catch (e) {
      await db.query('ROLLBACK')
      throw e
    }finally {
    }
    })

  // Length Downstream function
  router.get('/lengthDownstream/:long/:lat/:projection', async(req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", '*');
    var long = req.params.long;
    var lat = req.params.lat;
    // projection is hard coded because the geoview one does not work with this query
    // to set projection be read from geoview value use var projection = req.params.projection;
    var projection = '4269';
    // neo4j server connection
    const neo4j = require('neo4j-driver')
    const driver = new neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS));
    const session = driver.session();
    // pg routing function to get NHDID for given cordinate
      var cords = [long, lat]
      var params = [long, lat, projection]
      // find geom from cord and projection query
      const neo1text = `
      SELECT flow.nhdplusid FROM nhd_flow_catchment as catch, 
      nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) 
      AND ST_Contains(catch.geom, ST_Point($1,$2, $3)::geometry);`
      console.log('\n\n'+params);
      var startTime = performance.now()
    try{
      await db.query('BEGIN')
      const resu = await db.query(neo1text, params)
      let geo = resu.rows[0].nhdplusid
      console.log('\nThe catchment NHDID associated to these coordinates:('+cords.toString()+ ') is: '+geo);
  
      await driver.verifyConnectivity()
      console.log('\nNEO4j Query starting. Driver created')
      const result = await session.readTransaction(tx =>
        tx.run(
          // downstream query
          `MATCH(s:Segment) WHERE s.NodeID = $nodeid 
          OPTIONAL MATCH (s)-[d:downstream*]->(p) WITH s+COLLECT(DISTINCT p) 
          AS v UNWIND v as a RETURN a.NodeID as NodeID`
          ,
          { nodeid: ''+geo } 
        )
      ) 
      var arr = []
      const d_area = result.records.map(row =>{
        arr.push(row.get(0))
      })
      console.log('\nNumber of catchment: '+arr.length);
      var ids = arr.toString();
      console.log('Downstream flowpath returned')
      await session.close()
      console.log('Session Closed')
      await driver.close()
      console.log('Driver Closed')
  var endTime = performance.now()
  
  console.log(`Call to catchment plus neo4j request took ${endTime - startTime} milliseconds`)
  
  var startTime2 = performance.now()
      const q2=  `SELECT row_to_json(fc)
    FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
    FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Union(ARRAY(SELECT catch.geom FROM nhd_flow_catchment as catch 
  WHERE nhdplusid in (`+ids+`))))::json As geometry, (select row_to_json(t) from (select 'name') t)As properties) As f )  As fc;`
      const{rows} = await db.query(q2)
      res.json(rows)
      console.log('\nJson returned');
      const q3 = `SELECT sum(flow.lengthkm)
      FROM nhdflowlinejoined as flow 
      WHERE nhdplusid in (`+ids+`);`
      
      const len = await db.query(q3)
      let leng = len.rows[0].sum
      console.log('The length of the downstream path is: '+leng +" km");
    var endTime2 = performance.now()
    console.log(`Call to run build took ${endTime2 - startTime2} milliseconds`)
    }
    catch (e) {
      await db.query('ROLLBACK')
      throw e
    }finally {
    }
  })

  router.get('/NeoTest', async(req,res,next)=>{
    const neo4j = require('neo4j-driver')
    const driver = new neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS));
    const session = driver.session();
    var startTime = performance.now()
    try{
      await db.query('BEGIN')
      await driver.verifyConnectivity()
      console.log('\nNEO4j Query starting. \nDriver created')
      const result = await session.readTransaction(tx =>
        tx.run(
          `MATCH(s:Segment) WHERE s.NodeID = '60000200097498' 
          OPTIONAL MATCH (s)-[d:upstream*]->(n) RETURN DISTINCT n.NodeID as NodeID`
        )
      ) 
      var arr = []
      const d_area = result.records.map(row =>{
        arr.push(row.get(0))
      })
      console.log('\nNumber of catchment: '+arr.length);
      var ids = arr.toString();
      console.log('Drainage area found')
      
      await session.close()
      console.log('Session Closed')
      await driver.close()
      console.log('Driver Closed')
  var endTime = performance.now()
    }
    catch (e) {
      await db.query('ROLLBACK')
      throw e
    }finally {
    }
    }
  )

  // Faster pg 
  router.get('/neo3/:long/:lat/:projection', async(req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", '*');
    var long = req.params.long;
    var lat = req.params.lat;
    // projection is hard coded because the geoview one does not work with this query
    // to set projection be read from geoview value use var projection = req.params.projection;
    var projection = '4269';
    // neo4j server connection
    const neo4j = require('neo4j-driver')
    const driver = new neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS));
    const session = driver.session();
    // testing cordinates 
    // (-71.89046076469687,45.405030523198704) is: 60000200097498  6.5 k
    // (-73.22047019604169,44.79920361747254) is: 60000200030736 14 k
    // (-71.88947085504539,45.406337987383104) is: 60000200097957 23 k
    // (-73.27204878598127,44.56466640458342) is: 60000200000130 27k
  
    // pg routing function to get NHDID for given cordinate
      var cords = [long, lat]
      var params = [long, lat, projection]
      // find geom from cord and projection query
      const neo1text = `
      SELECT flow.nhdplusid FROM nhd_flow_catchment as catch, 
      nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) 
      AND ST_Contains(catch.geom, ST_Point($1,$2, $3)::geometry);`
      console.log(params);
      var startTime = performance.now()
    try{
      await db.query('BEGIN')
      const resu = await db.query(neo1text, params)
      let geo = resu.rows[0].nhdplusid
      console.log('\n\nThe catchment NHDID associated to these coordinates:('+cords.toString()+ ') is: '+geo);
  
      await driver.verifyConnectivity()
      console.log('\nNEO4j Query starting. \nDriver created')
      const result = await session.readTransaction(tx =>
        tx.run(
          // upstream query
          `MATCH(s:Segment) WHERE s.NodeID = $nodeid 
          OPTIONAL MATCH (s)-[d:upstream*]->(n) RETURN DISTINCT n.NodeID as NodeID`
          // downstream query
          // `MATCH(s:Segment) WHERE s.NodeID = $nodeid 
          // OPTIONAL MATCH (s)-[d:downstream*]->(p) WITH s+COLLECT(DISTINCT p) 
          // AS v UNWIND v as a RETURN a.NodeID as NodeID`
          ,
          { nodeid: ''+geo } 
        )
      ) 
      var arr = []
      const d_area = result.records.map(row =>{
        arr.push(row.get(0))
      })
      console.log('\nNumber of catchment: '+arr.length);
      var ids = arr.toString();
      console.log('Drainage area found')
      
      await session.close()
      console.log('Session Closed')
      await driver.close()
      console.log('Driver Closed')
  var endTime = performance.now()
  
  console.log(`Call to catchment plus neo4j request took ${endTime - startTime} milliseconds`)
  
  var startTime2 = performance.now()
      const q2=  `SELECT row_to_json(fc)
    FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
    FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Union(ARRAY(SELECT catch.geom FROM nhd_flow_catchment as catch 
  WHERE nhdplusid in (`+ids+`))))::json As geometry, (select row_to_json(t) from (select 'name') t)As properties) As f )  As fc;`
      const{rows} = await db.query(q2)
      res.json(rows)
      console.log('\nJson returned');
      
    var endTime2 = performance.now()
    console.log(`Call to run build took ${endTime2 - startTime2} milliseconds`)
    }
    catch (e) {
      await db.query('ROLLBACK')
      throw e
    }finally {
    }
    })

// other defined routes used for testing
router.get('/', function(req, res, next) {
  res.render('main');
});
router.get('/catch', async (req,res)=>{
  const {rows} = await db.query('Select * from nhd_flow_catchment LIMIT 100')
  res.status(200).json(rows)
});
router.get('/build', async (req,res)=>{
  // res.render('leaf')
  const {rows} = await db.query('SELECT ST_AsGeoJSON(ST_BuildArea(ST_Collect(ARRAY(SELECT catch.geom FROM nhd_flow_catchment as catch WHERE nhdplusid in (60000200095791,60000200093400)))));')
  // const {rows} = await db.query('SELECT catch.nhdplusid, ST_Union(geom) as MultiGeometry FROM nhd_flow_catchment as catch  WHERE nhdplusid in (60000200095791,60000200093400) GROUP by catch.nhdplusid;')
  res.status(200).json(rows)
});
router.get('/1', async(req,res)=>{
  const {rows} = await db.query('SELECT flow.geom, flow.nhdplusid FROM nhd_flow_catchment as catch, nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) AND ST_Contains(catch.geom, ST_Point(-71.589712, 45.142732, 4269)::geometry);')
  res.status(200).json(rows)
})
router.get('/neo', async(req,res)=>{
  // first pg query
  const cords = [-71.351387, 45.623438]
  const neo1text = `
  SELECT flow.nhdplusid FROM nhd_flow_catchment as catch, 
  nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) 
  AND ST_Contains(catch.geom, ST_Point($1,$2, 4269)::geometry);`
  var {ro2ws} = await db.query(neo1text, cords)
  var geo = Object.values(ro2ws[0])
  geo = geo.toString();
  console.log('The catchment NHDID associated to these coordinates:('+cords.toString()+ ') is: '+geo);

  //neo4j query
const neo4j = require('neo4j-driver')
const driver = new neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS));
const session = driver.session();
  const upstream = 'MATCH(s:Segment) WHERE s.NodeID = $nodeid OPTIONAL MATCH (s)-[d:upstream*]->(n) WITH s+COLLECT(DISTINCT n) AS v UNWIND v as a RETURN DISTINCT a.NodeID as NodeID';
  const params = { nodeid: geo };
  session.run(upstream, params)
      .then(res => {
          return res.records.map(row =>{
            return console.log(row.get("NodeID"))
          })
      })
      .then(NodeIds  => {
        // console.log(NodeIDs)
      })
      .catch(e => {
          // Output the error
          console.log(e);
      })
      .then(async () => {
          // Close the Session
          return session.close();
      })
      .then(() => {
          // Close the Driver
          return driver.close();
      });
  
   })
  
    const values = `60000200111811,60000200095791,60000200093400,60000200098883,60000200097265,60000200104225,60000200073311,60000200100781,60000200100757,60000200090764,
    60000200099499,60000200090660,60000200071706,60000200112361,60000200090138,60000200095685,60000200008399,60000200094726,60000200097126,60000200004202,60000200111443,60000200100765`
  router.get('/build2', async (req,res)=>{
    const {rows} = await db.query(b2, values)
    res.status(200).json(rows)
  });

router.get('/:cordx', async(req,res)=>{
  const {cordx} = req.params
  const {rows} = await db.query('SELECT flow.geom, flow.nhdplusid FROM nhd_flow_catchment as catch, nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) AND ST_Contains(catch.geom, ST_Point(-71.589712, 45.1732, $1)::geometry);',[cordx])
  res.status(200).json(rows)
})
router.get('/:cordx/:refsys', async(req,res)=>{
  const {cordx, refsys} = req.params
  const {rows} = await db.query('SELECT flow.geom, flow.nhdplusid FROM nhd_flow_catchment as catch, nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) AND ST_Contains(catch.geom, ST_Point($1, 45.1732, $2)::geometry);',[cordx, refsys])
  res.status(200).json(rows)
})
 

