import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { getConnection } from "../database/database";
import { Usuario, Role } from "../models/Usuario";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { Like } from "typeorm";

const router = Router();

const UsuarioSchema = z.object({
  nome: z.string().min(3),
  usuario: z.string().min(3),
  senha: z.string().min(8).optional(),
  telefone: z.string().min(11).optional(),
  email: z.email(),
  uf: z.string().min(2).optional(),
  cidade: z.string().min(3).optional(),
  logradouro: z.string().min(3).optional(),
  numero: z.coerce.number().optional(),
  role: z.enum(Role),
});

const AutoUpdateUsuarioSchema = z.object({
  nome: z.string().min(3).optional(),
  usuario: z.string().min(3).optional(),
  telefone: z.string().min(11).optional(),
  email: z.email().optional(),
  uf: z.string().min(2).optional(),
  cidade: z.string().min(3).optional(),
  logradouro: z.string().min(3).optional(),
  numero: z.number().optional(),
});

const senhaSchema = z.object({
  senha: z.string().min(8),
});
// POST /usuarios - Requer autenticação e role ADMIN
router.post("/", requireAuth, validate({ body: UsuarioSchema }), requireRole([Role.ADMIN]), async (req: Request, res: Response) => {
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
      role 
    } = req.body;
    
    const repository = getConnection().getRepository(Usuario);
    
    // Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(senha, 10);
    
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
      role: role as Role,
    });
    
    const savedUsuario = await repository.save(novoUsuario);
    res.status(201).json(savedUsuario);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// GET /usuarios - Requer autenticação e role LOCADOR ou ADMIN
router.get("/", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const page = Math.floor(offset / limit) + 1;

    const nome = (req.query.nome as string) || null;
    const funcao = (req.query.funcao as Role) || null;
    
    const repository = getConnection().getRepository(Usuario);

    // locador só lista clientes
    const isLocador = req.user?.role === Role.LOCADOR;

    const role = isLocador ? Role.CLIENTE : funcao;
    
    // Construir condições where
    const whereConditions: any = {};
    if (nome) {
      whereConditions.nome = Like(`%${nome}%`);
    }
    if (role) {
      whereConditions.role = role;
    }
    
    // Contar total de registros com os filtros aplicados
    const total = await repository.count({ where: whereConditions });
    
    // Buscar usuários paginados
    const usuarios = await repository.find({
      skip: offset,
      take: limit,
      where: whereConditions,
    });
    
    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    res.json({
      success: true,
      data: usuarios,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// GET /usuarios/me - Retorna dados do usuário logado (sem senha)
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    // Retornar dados do usuário sem senha
    const { senha: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// PUT /usuarios/me - Permite usuário alterar suas próprias informações
router.put("/me", requireAuth, validate({ body: AutoUpdateUsuarioSchema }), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    const repository = getConnection().getRepository(Usuario);
    const dbUsuario = await repository.findOne({ where: { id: req.user.id } });
    
    if (!dbUsuario) {
      return res.status(404).json({ detail: "Usuário não encontrado" });
    }

    Object.assign(dbUsuario, req.body);
    
    const updatedUsuario = await repository.save(dbUsuario);
    const { senha: _, ...userWithoutPassword } = updatedUsuario;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// PUT /usuarios/me/senha - Permite usuário alterar sua senha
router.put("/me/senha", requireAuth, validate({ body: senhaSchema }), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    const repository = getConnection().getRepository(Usuario);
    const dbUsuario = await repository.findOne({ where: { id: req.user.id } });
    
    if (!dbUsuario) {
      return res.status(404).json({ detail: "Usuário não encontrado" });
    }

    const hashedPassword = await bcrypt.hash(req.body.senha, 10);
    dbUsuario.senha = hashedPassword;
    
    await repository.save(dbUsuario);
    
    res.json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar senha do usuário" });
  }
});


// GET /usuarios/:id
router.get("/:id", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const repository = getConnection().getRepository(Usuario);
    const usuario = await repository.findOne({ where: { id: userId } });
    
    if (!usuario) {
      return res.status(404).json({ detail: "Usuário não encontrado" });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// PUT /usuarios/:id - Requer autenticação e role ADMIN
router.put("/:id", requireAuth, validate({ body: UsuarioSchema }), requireRole([Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const repository = getConnection().getRepository(Usuario);
    const dbUsuario = await repository.findOne({ where: { id: usuarioId } });
    
    if (!dbUsuario) {
      return res.status(404).json({ detail: "Usuário não encontrado" });
    }
    
    Object.assign(dbUsuario, req.body);
    if (req.body.senha) {
      dbUsuario.senha = await bcrypt.hash(req.body.senha, 10);
    }
    const updatedUsuario = await repository.save(dbUsuario);
    // Remover senha da resposta (por segurança)
    const { senha: _, ...userWithoutPassword } = updatedUsuario;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// DELETE /usuarios/:id - Requer autenticação e role ADMIN
router.delete("/:id", requireAuth, requireRole([Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const repository = getConnection().getRepository(Usuario);
    const usuario = await repository.findOne({ where: { id: usuarioId } });
    
    if (!usuario) {
      return res.status(404).json({ detail: "Usuário não encontrado" });
    }
    
    await repository.remove(usuario);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

export default router;
