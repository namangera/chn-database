// 1. Create constraint that NodeID is Unique
CREATE CONSTRAINT FOR (s:Segment) REQUIRE s.NodeID IS UNIQUE;
