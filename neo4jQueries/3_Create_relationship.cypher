// 3. Create relationship
MATCH
  (a:Segment),
  (b:Segment)
WHERE a.downStream = b.upStream
CREATE (b)-[r:upstream]->(a)
CREATE (a)-[e:downstream]->(b)
RETURN r,e;
