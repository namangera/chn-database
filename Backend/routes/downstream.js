const Router = require('express-promise-router')
const router = new Router()
const db = require('../queries')
const turf = require('@turf/turf')
module.exports = router;



// http://localhost:3000/downstream/segment/-71.99755088522/45.22905067826488/4269
router.get('/segment/:long/:lat/:projection', async(req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", '*');
    var long = req.params.long;
    var lat = req.params.lat;
    var projection = '4269';

    const neo4j = require('neo4j-driver')
    const driver = new neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "sherbrooke"));
    const session = driver.session();
  
    // pg routing function to get NHDID for given cordinate
      var cords = [long, lat]
      var params = [long, lat, projection]
      // find geom from cord and projection query
      const getNhdid = 
      `SELECT flow.nhdplusid FROM nhd_flow_catchment as catch, 
      nhdflowlinejoined as flow WHERE ST_Intersects(catch.geom, flow.geom) 
      AND ST_Contains(catch.geom, ST_Point($1,$2, $3)::geometry);`
      console.log(params);
      var startTime = performance.now()
    try{
      await db.query('BEGIN')
      const resu = await db.query(getNhdid, params)
      let geo = resu.rows[0].nhdplusid
      console.log('\n\nThe Flowline NHDID associated to these coordinates:('+cords.toString()+ ') is: '+geo);
  
      await driver.verifyConnectivity()
      console.log('\nNEO4j Query starting. \nDriver created')
      const result = await session.readTransaction(tx =>
        tx.run(
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
      // console.log(ids);
      console.log('Downstream segment found')
      
      await session.close()
      console.log('Session Closed')
      await driver.close()
      console.log('Driver Closed')
  var endTime = performance.now()
  
  console.log(`Call to flowpath plus neo4j request took ${endTime - startTime} milliseconds`)

  

  var startTime2 = performance.now()
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
    //   var dissolved = turf.dissolve(poly)
    //   res.json(dissolved)
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
