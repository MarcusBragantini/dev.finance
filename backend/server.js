const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
require("dotenv").config()

const { testConnection } = require("./config/database")

// Importar rotas
const authRoutes = require("./routes/auth")
const transactionRoutes = require("./routes/transactions")
const categoryRoutes = require("./routes/categories")

// Inicializar app
const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
)
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Dev.Finance$ está rodando!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      transactions: "/api/transactions",
      categories: "/api/categories",
    },
  })
})

// Rota de health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
  })
})

// Rotas da API
app.use("/api/auth", authRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/categories", categoryRoutes)

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro:", err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erro interno do servidor",
  })
})

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    const dbConnected = await testConnection()

    if (!dbConnected) {
      console.error("❌ Não foi possível conectar ao banco de dados")
      console.log("⚠️  Verifique as configurações em .env")
      process.exit(1)
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("")
      console.log("🚀 ===================================")
      console.log(`🚀  Servidor Dev.Finance$ rodando!`)
      console.log(`🚀  Porta: ${PORT}`)
      console.log(`🚀  Ambiente: ${process.env.NODE_ENV || "development"}`)
      console.log(`🚀  URL: http://localhost:${PORT}`)
      console.log("🚀 ===================================")
      console.log("")
    })
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error)
    process.exit(1)
  }
}

startServer()

module.exports = app
