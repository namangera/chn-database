// 4. Downstream find
MATCH(s:Segment)
WHERE s.NodeID = '60000200097498'
OPTIONAL MATCH (s)-[d:downstream*]->(p)
RETURN DISTINCT p.NodeID