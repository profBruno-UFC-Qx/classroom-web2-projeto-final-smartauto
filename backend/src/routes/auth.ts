import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { getConnection } from "../database/database";
import { Usuario, Role } from "../models/Usuario";
import { generateToken } from "../middleware/auth";

// Carregar variáveis do arquivo .env
dotenv.config();

const router = Router();

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
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
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !usuario || !senha || !telefone || !email || !uf || !cidade || !logradouro || numero === undefined) {
      return res.status(400).json({ 
        error: "Todos os campos são obrigatórios" 
      });
    }

    const repository = getConnection().getRepository(Usuario);
    
    // Verificar se o usuário já existe
    const existingUser = await repository.findOne({ where: { usuario } });
    if (existingUser) {
      return res.status(400).json({ 
        error: "Usuário já existe" 
      });
    }

    // Verificar se o email já existe
    const existingEmail = await repository.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ 
        error: "Email já cadastrado" 
      });
    }

    // Determinar role baseado na api_key
    let userRole = Role.CLIENTE; // Padrão: CLIENTE
    
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

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar novo usuário com role determinada
    const novoUsuario = repository.create({
      nome,
      usuario,
      senha: hashedPassword,
      telefone,
      email,
      uf,
      cidade,
      logradouro,
      numero,
      role: userRole,
    });

    const savedUsuario = await repository.save(novoUsuario);

    // Gerar token JWT
    const token = generateToken(savedUsuario);

    // Retornar token e informações do usuário (sem senha)
    const { senha: _, ...userWithoutPassword } = savedUsuario;
    res.status(201).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ 
        error: "Usuário e senha são obrigatórios" 
      });
    }

    const repository = getConnection().getRepository(Usuario);
    const user = await repository.findOne({ where: { usuario } });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Verificar senha usando bcrypt
    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gerar token JWT
    const token = generateToken(user);

    // Retornar token e informações do usuário (sem senha)
    const { senha: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar login" });
  }
});

export default router;
