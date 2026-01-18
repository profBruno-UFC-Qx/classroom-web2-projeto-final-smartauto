import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { getConnection } from "../database/database";
import { Usuario, Role } from "../models/Usuario";
import { generateToken, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

// Carregar variáveis do arquivo .env
dotenv.config();

const router = Router();

const UserRegisterSchema = z.object({
  nome: z.string().min(3),
  usuario: z.string().min(3),
  senha: z.string().min(8),
  telefone: z.string().min(11).optional(),
  email: z.email(),
  uf: z.string().min(2).optional(),
  cidade: z.string().min(3).optional(),
  logradouro: z.string().min(3).optional(),
  numero: z.string().optional(),
  api_key: z.string().optional(),
});

// POST /auth/register
router.post("/register", validate({ body: UserRegisterSchema }), async (req: Request, res: Response) => {
  try {
    const { 
      nome, 
      usuario, 
      senha, 
      telefone, 
      email, 
      uf, 
      cidade, 
      logradouro, 
      numero,
      api_key 
    } = req.body as z.infer<typeof UserRegisterSchema>;

    const repository = getConnection().getRepository(Usuario);
    
    const existingUser = await repository.findOne({ where: { usuario } });
    if (existingUser) {
      return res.status(400).json({ 
        error: "Usuário já existe" 
      });
    }

    const existingEmail = await repository.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ 
        error: "Email já cadastrado" 
      });
    }

    let userRole = Role.CLIENTE;
    
    if (api_key) {
      // Se api_key foi fornecida, verificar se corresponde ao valor do .env
      const validApiKey = process.env.ADMIN_API_KEY;
      if (validApiKey && api_key === validApiKey) {
        userRole = Role.ADMIN;
      } else {
        return res.status(403).json({ 
          error: "API key inválida" 
        });
      }
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const novoUsuario: Usuario = repository.create({
      nome,
      usuario,
      senha: hashedPassword,
      telefone: telefone ?? undefined,
      email,
      uf: uf ?? undefined,
      cidade: cidade ?? undefined,
      logradouro: logradouro ?? undefined,
      numero: numero ?? undefined,
      role: userRole,
    });

    const savedUsuario = await repository.save(novoUsuario);

    const token = generateToken(savedUsuario);

    const { senha: _, ...userWithoutPassword } = savedUsuario;
    res.status(201).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ 
      error: "Erro ao registrar usuário",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /auth/login
const UserLoginSchema = z.object({
  usuario: z.string().min(3),
  senha: z.string().min(8),
});

router.post("/login", validate({ body: UserLoginSchema }), async (req: Request, res: Response) => {
  try {
    const { usuario, senha } = req.body as z.infer<typeof UserLoginSchema>;

    const repository = getConnection().getRepository(Usuario);
    const user = await repository.findOne({ where: { usuario } });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = generateToken(user);

    const { senha: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar login" });
  }
});

// GET /auth/me - Retorna os dados do usuário autenticado
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { senha: _, ...userWithoutPassword } = req.user;
    res.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter dados do usuário" });
  }
});

export default router;
