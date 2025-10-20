const jwt = require("jsonwebtoken")

/**
 * Middleware de autenticação JWT
 */
const authMiddleware = (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token não fornecido",
      })
    }

    // Formato: Bearer <token>
    const parts = authHeader.split(" ")

    if (parts.length !== 2) {
      return res.status(401).json({
        success: false,
        message: "Token mal formatado",
      })
    }

    const [scheme, token] = parts

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        success: false,
        message: "Token mal formatado",
      })
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Token inválido ou expirado",
        })
      }

      // Adicionar dados do usuário na requisição
      req.userId = decoded.id
      req.userEmail = decoded.email

      return next()
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Falha na autenticação",
    })
  }
}

module.exports = authMiddleware
