// 5. Upstream find with NHD
MATCH(s:Segment)
WHERE s.NodeID = '60000200097498'
OPTIONAL MATCH (s)-[d:upstream*]->(n)
RETURN DISTINCT n.NodeID