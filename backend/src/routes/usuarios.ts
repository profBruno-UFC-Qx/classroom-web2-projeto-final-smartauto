import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { getConnection } from "../database/database";
import { Usuario, Role } from "../models/Usuario";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// POST /usuarios - Requer autenticação e role ADMIN
router.post("/", requireAuth, requireRole([Role.ADMIN]), async (req: Request, res: Response) => {
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
router.put("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    const repository = getConnection().getRepository(Usuario);
    const dbUsuario = await repository.findOne({ where: { id: req.user.id } });
    
    if (!dbUsuario) {
      return res.status(404).json({ detail: "Usuário não encontrado" });
    }
    
    // Atualizar campos permitidos (não permitir alterar role)
    if (req.body.nome !== undefined) dbUsuario.nome = req.body.nome;
    if (req.body.usuario !== undefined) dbUsuario.usuario = req.body.usuario;
    if (req.body.senha !== undefined) {
      // Hash da senha antes de atualizar
      dbUsuario.senha = await bcrypt.hash(req.body.senha, 10);
    }
    if (req.body.telefone !== undefined) dbUsuario.telefone = req.body.telefone;
    if (req.body.email !== undefined) dbUsuario.email = req.body.email;
    if (req.body.uf !== undefined) dbUsuario.uf = req.body.uf;
    if (req.body.cidade !== undefined) dbUsuario.cidade = req.body.cidade;
    if (req.body.logradouro !== undefined) dbUsuario.logradouro = req.body.logradouro;
    if (req.body.numero !== undefined) dbUsuario.numero = req.body.numero;
    // Não permitir alterar role através de /me
    
    const updatedUsuario = await repository.save(dbUsuario);
    const { senha: _, ...userWithoutPassword } = updatedUsuario;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
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
router.put("/:id", requireAuth, requireRole([Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const repository = getConnection().getRepository(Usuario);
    const dbUsuario = await repository.findOne({ where: { id: usuarioId } });
    
    if (!dbUsuario) {
      return res.status(404).json({ detail: "Usuário não encontrado" });
    }
    
    // Atualizar campos
    if (req.body.nome !== undefined) dbUsuario.nome = req.body.nome;
    if (req.body.usuario !== undefined) dbUsuario.usuario = req.body.usuario;
    if (req.body.senha !== undefined) {
      // Hash da senha antes de atualizar
      dbUsuario.senha = await bcrypt.hash(req.body.senha, 10);
    }
    if (req.body.telefone !== undefined) dbUsuario.telefone = req.body.telefone;
    if (req.body.email !== undefined) dbUsuario.email = req.body.email;
    if (req.body.uf !== undefined) dbUsuario.uf = req.body.uf;
    if (req.body.cidade !== undefined) dbUsuario.cidade = req.body.cidade;
    if (req.body.logradouro !== undefined) dbUsuario.logradouro = req.body.logradouro;
    if (req.body.numero !== undefined) dbUsuario.numero = req.body.numero;
    if (req.body.role !== undefined) dbUsuario.role = req.body.role as Role;
    
    const updatedUsuario = await repository.save(dbUsuario);
    res.json(updatedUsuario);
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
