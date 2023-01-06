// 2. Create nodes using MERGE
:auto LOAD CSV WITH HEADERS FROM 'file:///NHD_flow.csv' AS line
MERGE (s:Segment {NodeID: line.NHDPlusID})
ON CREATE SET
    s.downStream = line.NHDPlusFlowlineVAA_ToNode,
    s.upStream = line.NHDPlusFlowlineVAA_FromNode;
