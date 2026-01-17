import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { getConnection } from "../database/database";
import { Usuario, Role } from "../models/Usuario";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";
import { validate } from "../middleware/validate";

const router = Router();

const UsuarioSchema = z.object({
  nome: z.string().min(3),
  usuario: z.string().min(3),
  senha: z.string().min(8),
  telefone: z.string().min(11).optional(),
  email: z.email(),
  uf: z.string().min(2).optional(),
  cidade: z.string().min(3).optional(),
  logradouro: z.string().min(3).optional(),
  numero: z.number().optional(),
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
    
    const repository = getConnection().getRepository(Usuario);
    const usuarios = await repository.find({
      skip: offset,
      take: limit,
    });
    
    res.json(usuarios);
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
// GET /usuarios/nome/:nome (busca por nome) - DEVE VIR ANTES DE /:id
router.get("/nome/:nome", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const nome = req.params.nome;
    const repository = getConnection().getRepository(Usuario);
    const usuarios = await repository
      .createQueryBuilder("usuario")
      .where("usuario.nome LIKE :nome", { nome: `%${nome}%` })
      .getMany();
    
    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ detail: "Usuário não encontrado" });
    }
    
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário por nome" });
  }
});

// GET /usuarios/role/:role - DEVE VIR ANTES DE /:id
router.get("/role/:role", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const role = req.params.role as Role;
    const repository = getConnection().getRepository(Usuario);
    const usuarios = await repository.find({
      where: { role },
    });
    
    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ detail: "Usuários não encontrados" });
    }
    
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários por role" });
  }
});

// GET /usuarios/:id - DEVE VIR DEPOIS DAS ROTAS ESPECÍFICAS
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
    dbUsuario.senha = await bcrypt.hash(req.body.senha, 10);
    await repository.save(dbUsuario);
    res.json({ message: "Usuário atualizado com sucesso" });
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
