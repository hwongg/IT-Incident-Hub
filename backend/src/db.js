const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://incident_user:change_me_local@localhost:5432/incident_hub"
});

module.exports = pool;
