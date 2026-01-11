import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getConnection } from "../database/database";
import { Usuario, Role } from "../models/Usuario";

// Estender interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "smartauto-secret-key-change-in-production";

// Middleware para validar token JWT
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Token de autenticação não fornecido" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar e decodificar token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: Role;
      usuario: string;
    };

    // Buscar usuário no banco de dados
    const repository = getConnection().getRepository(Usuario);
    const user = await repository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ error: "Usuário não encontrado" });
      return;
    }

    // Adicionar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Token inválido" });
      return;
    }
    res.status(500).json({ error: "Erro ao validar token" });
  }
};

// Middleware para verificar roles permitidas
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: "Acesso negado. Permissão insuficiente.",
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

// Função auxiliar para gerar token JWT
export const generateToken = (user: Usuario): string => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      usuario: user.usuario,
    },
    JWT_SECRET,
    {
      expiresIn: "7d", // Token expira em 7 dias
    }
  );
};
