const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1

app.get("/states/", async (request, response) => {
  const statesQuery = `
        SELECT 
        *
        FROM 
        state;`;
  const statesList = await db.all(statesQuery);
  response.send(statesList);
});

//API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const statesQuery = `
        SELECT *
        FROM state
        WHERE state_id = ${stateId};`;
  const state = await db.all(statesQuery);
  response.send(state);
});

//API 3

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const postDistrictQuery = `
                INSERT INTO 
                    district(district_name,state_id,cases,cured,active,deaths)
                VALUES (
                    '${districtName}',
                    '${stateId}',
                    '${cases}',
                    '${cured}',
                    '${active}',
                    '${deaths}'
                );`;
  const responseDB = await db.run(postDistrictQuery);
  response.send(responseDB);
});

//API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtQuery = `
        SELECT *
        FROM district
        WHERE district_id = ${districtId};`;
  const responseDB = await db.all(districtQuery);
  response.send(responseDB);
});

//API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
                DELETE FROM district
                WHERE district_id = ${districtId};`;
  const responseDB = db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateQuery = `
            UPDATE district
            SET 
                district_name = '${districtName}',
                state_id = '${stateId}',
                cases = '${cases}',
                cured = '${cured}',
                active = '${active}',
                deaths = '${deaths}'
            WHERE district_id = ${districtId};`;
  const responseDB = await db.run(updateQuery);
  response.send("District Details Updated");
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const statsQuery = `
            SELECT SUM(cases) AS totalCases,
                    SUM(cured) AS totalCured,
                    SUM(active) AS totalActive,
                    SUM(deaths) AS totalDeaths
            FROM district
            WHERE state_id = ${stateId}
            GROUP BY state_id;`;
  const responseDB = await db.get(statsQuery);
  response.send(responseDB);
});

//API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const stateNameQuery = `
            SELECT state.state_name
            FROM state 
                NATURAL JOIN district
            WHERE district_id = ${districtId};`;
  const responseDB = await db.get(stateNameQuery);
  response.send(responseDB);
});

module.exports = app;
