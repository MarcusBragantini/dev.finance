const mysql = require("mysql2/promise")
require("dotenv").config()

// Configuração do pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dev_finance",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

// Testar conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Conexão com MySQL estabelecida com sucesso!")
    connection.release()
    return true
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error.message)
    return false
  }
}

module.exports = { pool, testConnection }
