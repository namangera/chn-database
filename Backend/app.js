var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mountRoutes = require('./routes')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var db = require('./queries');
var app = express();
mountRoutes(app)
// const neo4j = require('neo4j-driver')
// const driver = new neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "sherbrooke"));
// const session = driver.session();

// // // // const cypher = 'MATCH (n) RETURN count(n) as count';

// const upstream = 'MATCH(s:Segment) WHERE s.NodeID = $nodeid OPTIONAL MATCH (s)-[d:upstream*]->(n) WITH s+COLLECT(DISTINCT n) AS v UNWIND v as a RETURN DISTINCT a.NodeID as NodeID';

// const params = { nodeid: '600a1565-ac79-409e-b0e9-bcdc034306ab' };
// // session.run(cypher2, params)
// session.run(upstream, params)
//     .then(result => {
//         // On result, get count from first record
//         // const count = result.records[0].get('count');
//         // Log response
//         // console.log( count.toNumber() );
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


// // const downstream = 'MATCH(s:Segment) WHERE s.NodeID = $nodeid OPTIONAL MATCH (s)-[d:downstream*]->(p) WITH s+COLLECT(DISTINCT p) AS v UNWIND v as a RETURN a.NodeID as NodeID'
// // session.run(downstream, params)
// //       .then(result => {
// //         // On result, get count from first record
// //         // const count = result.records[0].get('NodeID');
// //         // Log response
// //         // console.log( count.toNumber() );
// //         return result.records.map(record =>{
// //           console.log(record.get("NodeID"));
// //         });
// //       })
// //       .catch(e => {
// //         // Output the error
// //         console.log(e);
// //       })
// //       .then(() => {
// //         // Close the Session
// //         return session.close();
// //       })
// //       .then(() => {
// //         // Close the Driver
// //         return driver.close();
// //       });


// app.get('/users/2', gdb.getArea)
// app.get('/users', db.getCatchment)
// app.get('/users/1', db.getID)
// app.get('/users/:cordx',db.getID2)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
