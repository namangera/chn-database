CHN DATABASE

to run backend: npm run devstart

to run frontend(hydronetwork file): npm run serve

Data folder contains data for neo4j and postgis

Neo4j DB

    Install instuctions: https://neo4j.com/docs/operations-manual/current/installation/windows/

    Download Oracle Java 17 for neo4j version 5, for version 4.4 use java 11
    https://www.oracle.com/java/technologies/downloads/
    
    cd into the file noe4j-community-5.2.0 or other version number 
    run: bin\neo4j console
    server should run

    now go to http://localhost:7474/browser/

    First time you will need to login, default login is neo4j/neo4j

    Use scripts in neo4jQueries folder

    NOTE to upload data you need to have the approcoapte CSV file in the import folder of neo4j (C:\Users...Desktop\neo4j-community-5.2.0\import)

Postgres

download postgres 15

using stackbuilder install postgis more info here: https://www.bostongis.com/PrinterFriendly.aspx?content_name=postgis_tut01

run:
CREATE EXTENSION postgis;

CREATE INDEX IF NOT EXISTS nhd_flow_catchment_id_idx
    ON public.nhd_flow_catchment USING btree
    (nhdplusid ASC NULLS LAST)
    TABLESPACE pg_default;

How to add data to postgis, data can be found in data folder
Using OSGeo4W Shell (installed with QGIS)
 Open OSGeo4W Shell
cd to directory with gpkg file
ogr2ogr -f PostgreSQL "PG:user=youruser password=yourpassword dbname=yourdbname" yourgeopackage.gpkg



