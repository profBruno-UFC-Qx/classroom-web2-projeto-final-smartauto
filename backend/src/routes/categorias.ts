import { Router, Request, Response } from "express";
import { getConnection } from "../database/database";
import { Categoria } from "../models/Categoria";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "../models/Usuario";

const router = Router();

// POST /categorias - Requer autenticação e role LOCADOR ou ADMIN
router.post("/", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { nome, descricao } = req.body;
    const repository = getConnection().getRepository(Categoria);
    
    const categoria = repository.create({
      nome,
      desc: descricao,
    });
    
    const savedCategoria = await repository.save(categoria);
    res.json(savedCategoria);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar categoria" });
  }
});

// GET /categorias
router.get("/", async (req: Request, res: Response) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    
    const repository = getConnection().getRepository(Categoria);
    const categorias = await repository.find({
      skip: offset,
      take: limit,
    });
    
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar categorias" });
  }
});

// GET /categorias/:categoria_id
router.get("/:categoria_id", async (req: Request, res: Response) => {
  try {
    const categoriaId = parseInt(req.params.categoria_id);
    const repository = getConnection().getRepository(Categoria);
    const categoria = await repository.findOne({ where: { id: categoriaId } });
    
    if (!categoria) {
      return res.status(404).json({ detail: "Categoria not found" });
    }
    
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar categoria" });
  }
});

// PUT /categorias/:categoria_id - Requer autenticação e role LOCADOR ou ADMIN
router.put("/:categoria_id", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const categoriaId = parseInt(req.params.categoria_id);
    const repository = getConnection().getRepository(Categoria);
    const categoria = await repository.findOne({ where: { id: categoriaId } });
    
    if (!categoria) {
      return res.status(404).json({ detail: "Categoria not found" });
    }
    
    // Atualizar campos
    if (req.body.nome !== undefined) categoria.nome = req.body.nome;
    if (req.body.desc !== undefined) categoria.desc = req.body.desc;
    if (req.body.descricao !== undefined) categoria.desc = req.body.descricao;
    
    const updatedCategoria = await repository.save(categoria);
    res.json(updatedCategoria);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar categoria" });
  }
});

// DELETE /categorias/:categoria_id - Requer autenticação e role LOCADOR ou ADMIN
router.delete("/:categoria_id", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const categoriaId = parseInt(req.params.categoria_id);
    const repository = getConnection().getRepository(Categoria);
    const categoria = await repository.findOne({ where: { id: categoriaId } });
    
    if (!categoria) {
      return res.status(404).json({ detail: "Categoria not found" });
    }
    
    await repository.remove(categoria);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar categoria" });
  }
});

export default router;
