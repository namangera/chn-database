const Router = require('express-promise-router')
const router = new Router()
const db = require('../queries')
const turf = require('@turf/turf')
fs = require('fs');
module.exports = router;

// http://localhost:3000/drainage/area/-71.99755088522/45.22905067826488/4269
// http://localhost:3000/drainage/area/-71.88980819483163/45.40592175723562/4269 23 k 

router.get('/area/:long/:lat/:projection', async(req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", '*');
    var long = req.params.long;
    var lat = req.params.lat;
    var projection = '4269';

    const neo4j = require('neo4j-driver')
    const driver = new neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS));
    const session = driver.session();
  
    // pg routing function to get NHDID for given cordinate
      var cords = [long, lat]
      var params = [long, lat, projection]
      // find geom from cord and projection query
      const getNhdid = `
      SELECT catch.nhdplusid FROM nhd_flow_catchment as catch
      WHERE ST_Contains(catch.geom, ST_Point($1,$2, $3)::geometry);`
      console.log(params);
      var startTime = performance.now()
    try{
      await db.query('BEGIN')
      const resu = await db.query(getNhdid, params)
      let geo = resu.rows[0].nhdplusid
      console.log('\n\nThe catchment NHDID associated to these coordinates:('+cords.toString()+ ') is: '+geo);
  
      await driver.verifyConnectivity()
      console.log('\nNEO4j Query starting. \nDriver created')
      const result = await session.readTransaction(tx =>
        tx.run(
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
      // console.log(ids);
      console.log('Drainage area found')
      
      await session.close()
      console.log('Session Closed')
      await driver.close()
      console.log('Driver Closed')
  var endTime = performance.now()
  
  console.log(`Call to catchment plus neo4j request took ${endTime - startTime} milliseconds`)

  

  var startTime2 = performance.now()
      const geom_return= 
      `SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
        )
    FROM (SELECT ST_UNION(ARRAY(SELECT DISTINCT catch.geom FROM nhd_flow_catchment as catch
	WHERE nhdplusid in (`+ids+`))))
          as t(geom);`
// https://gis.stackexchange.com/questions/324736/extracting-single-boundary-from-multipolygon-in-postgis
        const boundary_return = 
        `SELECT ST_ExteriorRing((ST_Dump(ST_Union(geom))).geom) as geom
        FROM (SELECT DISTINCT catch.geom FROM nhd_flow_catchment as catch
      WHERE nhdplusid in (`+ids+`))
              as t(geom);`
        const boundary_return2 = 
        `SELECT ST_ExteriorRing((ST_Dump(geom)).geom) as geom FROM (SELECT DISTINCT catch.geom FROM nhd_flow_catchment as catch
          WHERE nhdplusid in (`+ids+`))
                  as t(geom);`
//      `SELECT json_build_object(
//         'type', 'FeatureCollection',
//         'features', json_agg(ST_AsGeoJSON(t.*)::json)
//         )
//     FROM (SELECT (ST_Dump(geom)).geom AS geom 
// FROM(SELECT DISTINCT catch.geom FROM nhd_flow_catchment as catch
// 	WHERE nhdplusid in (`+ids+`)) as geom)
//           as t(geom);`
//       `SELECT json_build_object(
//         'type', 'FeatureCollection',
//         'features', json_agg(ST_AsGeoJSON(t.*)::json)
//         )
//     FROM (SELECT st_geometryn(geom,1) 
// FROM(SELECT DISTINCT catch.geom FROM nhd_flow_catchment as catch
// 	WHERE nhdplusid in (`+ids+`)) as geom)
//           as t(geom);`
      // const{rows} = await db.query(geom_return)
      const{rows} = await db.query(boundary_return2)
      // var poly = rows[0].json_build_object
      // res.json(poly)
          res.json(rows)
      // var dissolved = turf.dissolve(poly)
      // res.json(dissolved)
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