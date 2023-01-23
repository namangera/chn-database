# CHN_backend
CHN DATABASE
Node: 18.12.1
Neo4j: 5.2
Postgres: 15
JDK: 17
QGIS: 3.28.1

to run backend: npm run devstart

to run frontend(https://github.com/Sacha-rncan/hydronetwork): npm run serve

Ask me for access to the Data folder that contains data for neo4j and postgis

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

    How to add data to postgis, data can be found in data folder
    Using OSGeo4W Shell (installed with QGIS)
     Open OSGeo4W Shell
    cd to directory with gpkg file
    ogr2ogr -f PostgreSQL "PG:user=youruser password=yourpassword dbname=yourdbname" yourgeopackage.gpkg

    CREATE INDEX IF NOT EXISTS nhd_flow_catchment_id_idx
        ON public.nhd_flow_catchment USING btree
        (nhdplusid ASC NULLS LAST)
        TABLESPACE pg_default;


Setting up your environment variables

    Create a file in the same directory as the package.json called ".env"

    add the following:
        DB_USER = <your db user>
        DB_PASS = <your db password>
        DB_HOST = <your db host url>
        DB_NAME = <your db name>
        DB_PORT = <your db port>
        NEO4J_HOST = <your neo4j url e.g. neo4j://localhost:7687>
        NEO4J_USER = <your neo4j user>
        NEO4J_PASS = <your neo4j passwordnpm >
