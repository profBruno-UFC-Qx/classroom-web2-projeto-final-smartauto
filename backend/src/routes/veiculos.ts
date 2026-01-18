import { Router, Request, Response } from "express";
import { getConnection } from "../database/database";
import { Veiculo } from "../models/Veiculo";
import { Categoria } from "../models/Categoria";
import { CategoriaVeiculo } from "../models/CategoriaVeiculo";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "../models/Usuario";
import { z } from "zod";
import { validate } from "../middleware/validate";

const VeiculoSchema = z.object({
  marca: z.string().min(3),
  modelo: z.string().min(3),
  ano: z.number(),
  valor_diaria: z.number(),
  disponivel: z.boolean(),
  cor: z.string().min(3),
});

const VeiculoUpdateSchema = z.object({
  marca: z.string().min(3).optional(),
  modelo: z.string().min(3).optional(),
  ano: z.number().optional(),
  valor_diaria: z.number().optional(),
  disponivel: z.boolean().optional(),
  cor: z.string().min(3).optional(),
});

const CategoriaVeiculoSchema = z.object({
  nome_categoria: z.string().min(3),
  descricao: z.string().min(3).optional(),
});

const router = Router();
// POST /veiculos - Requer autenticação e role LOCADOR ou ADMIN
router.post("/", requireAuth, validate({ body: VeiculoSchema }), requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const veiculoReq = req.body as z.infer<typeof VeiculoSchema>;
    const repository = getConnection().getRepository(Veiculo);
    const veiculo: Veiculo = repository.create(veiculoReq);
    const savedVeiculo = await repository.save(veiculo);
    res.status(201).json(savedVeiculo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar veículo" });
  }
});

// GET /veiculos
router.get("/", async (req: Request, res: Response) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const page = Math.floor(offset / limit) + 1;
    const repository = getConnection().getRepository(Veiculo);
    
    // Query params para filtros (null se não enviado)
    const modelo = (req.query.modelo as string) || null;
    const marca = (req.query.marca as string) || null;
    const ano = req.query.ano ? parseInt(req.query.ano as string) : null;
    const minPreco = req.query.min_preco ? parseFloat(req.query.min_preco as string) : null;
    const maxPreco = req.query.max_preco ? parseFloat(req.query.max_preco as string) : null;
    // Se disponiveis não for enviado, filtra por disponíveis=true (comportamento padrão)
    // Se for "false", filtra por disponíveis=false. Se for "true" ou "", filtra por disponíveis=true
    const disponivelParam = req.query.disponiveis === undefined 
      ? true  // Comportamento padrão: filtrar por disponíveis
      : (req.query.disponiveis === "false" ? false : true);
      // : Boolean(req.query.disponiveis);
    const categoria = (req.query.categoria as string) || null;
    
    // Parâmetros de ordenação
    const orderBy = (req.query.order_by as string) || "id";
    const order = (req.query.order as string)?.toLowerCase() === "desc" ? "DESC" : "ASC";
    
    // Validar campo de ordenação (whitelist para segurança)
    const allowedOrderByFields = ["id", "marca", "modelo", "ano", "valor_diaria", "cor"];
    const validOrderBy = allowedOrderByFields.includes(orderBy) ? orderBy : "id";
    
    const queryBuilder = repository
      .createQueryBuilder("veiculo")
      .leftJoinAndSelect("veiculo.categorias", "categoria")
      .where("(:modelo IS NULL OR veiculo.modelo LIKE :modeloLike)", {
        modelo: modelo,
        modeloLike: modelo ? `%${modelo}%` : null
      })
      .andWhere("(:marca IS NULL OR veiculo.marca LIKE :marcaLike)", {
        marca: marca,
        marcaLike: marca ? `%${marca}%` : null
      })
      .andWhere("(:ano IS NULL OR veiculo.ano = :ano)", { ano })
      .andWhere("(:minPreco IS NULL OR veiculo.valor_diaria >= :minPreco)", { minPreco })
      .andWhere("(:maxPreco IS NULL OR veiculo.valor_diaria <= :maxPreco)", { maxPreco })
      .andWhere("veiculo.disponivel = :disponivel", { disponivel: disponivelParam })
      .andWhere("(:categoria IS NULL OR categoria.nome = :categoria)", { categoria })
      .orderBy(`veiculo.${validOrderBy}`, order);
    
    // Contar total de registros com os filtros aplicados
    const total = await queryBuilder.getCount();
    
    // Buscar veículos paginados
    const veiculos = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();
    
    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    res.json({
      success: true,
      data: veiculos,
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
    res.status(500).json({ error: "Erro ao listar veículos" });
  }
});

// DELETE /veiculos/categoria - Remove associação entre categoria e veículo (requer autenticação: LOCADOR ou ADMIN)
router.delete("/categoria", requireAuth, validate({ query: z.object({ veiculo: z.coerce.number(), categoria: z.coerce.number() }) }), requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    // Validar se os parâmetros foram fornecidos
    if (!req.query.veiculo || !req.query.categoria) {
      return res.status(400).json({ 
        detail: "Parâmetros 'veiculo' e 'categoria' são obrigatórios" 
      });
    }

    const veiculoId = parseInt(req.query.veiculo as string);
    const categoriaId = parseInt(req.query.categoria as string);

    // Validar se são números válidos
    if (isNaN(veiculoId) || isNaN(categoriaId)) {
      return res.status(400).json({ 
        detail: "Parâmetros 'veiculo' e 'categoria' devem ser números válidos" 
      });
    }

    const categoriaVeiculoRepository = getConnection().getRepository(CategoriaVeiculo);
    const veiculoRepository = getConnection().getRepository(Veiculo);
    
    const veiculo = await veiculoRepository.findOne({ where: { id: veiculoId } });
    if (!veiculo) {
      return res.status(404).json({ detail: "Veículo não encontrado" });
    }
    
    const categoriaVeiculo = await categoriaVeiculoRepository.findOne({ 
      where: { veiculo_id: veiculoId, categoria_id: categoriaId } 
    });
    
    if (!categoriaVeiculo) {
      return res.status(404).json({ 
        detail: "Categoria associada ao veículo não encontrada" 
      });
    }
    
    await categoriaVeiculoRepository.remove(categoriaVeiculo);
    res.json({ ok: true, detail: "Categoria associada ao veículo removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover associação categoria-veículo:", error);
    res.status(500).json({ error: "Erro ao remover associação entre categoria e veículo" });
  }
});

// GET /veiculos/:veiculo_id
router.get("/:veiculo_id", async (req: Request, res: Response) => {
  try {
    const veiculoId = parseInt(req.params.veiculo_id);
    const repository = getConnection().getRepository(Veiculo);
    const veiculo = await repository.findOne({ where: { id: veiculoId } });
    
    if (!veiculo) {
      return res.status(404).json({ detail: "Veículo não encontrado" });
    }
    
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículo" });
  }
});

// PUT /veiculos/:veiculo_id - Requer autenticação e role LOCADOR ou ADMIN
router.put("/:veiculo_id", requireAuth, validate({ body: VeiculoUpdateSchema }), requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const veiculoId = parseInt(req.params.veiculo_id);
    const repository = getConnection().getRepository(Veiculo);
    const dbVeiculo = await repository.findOne({ where: { id: veiculoId } });
    
    if (!dbVeiculo) {
      return res.status(404).json({ detail: "Veículo não encontrado" });
    }
    
    const veiculoReq = req.body as z.infer<typeof VeiculoUpdateSchema>;
    // Atualizar campos
    Object.assign(dbVeiculo, veiculoReq);
    
    const updatedVeiculo = await repository.save(dbVeiculo);
    res.json(updatedVeiculo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar veículo" });
  }
});

// DELETE /veiculos/:veiculo_id - Requer autenticação e role LOCADOR ou ADMIN
router.delete("/:veiculo_id", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const veiculoId = parseInt(req.params.veiculo_id);
    const repository = getConnection().getRepository(Veiculo);
    const veiculo = await repository.findOne({ where: { id: veiculoId } });
    
    if (!veiculo) {
      return res.status(404).json({ detail: "Veículo não encontrado" });
    }
    
    await repository.remove(veiculo);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover veículo" });
  }
});

// POST /veiculos/categoria/:veiculo_id - Requer autenticação e role LOCADOR ou ADMIN
router.post("/categoria/:veiculo_id", requireAuth, validate({ body: CategoriaVeiculoSchema }), requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const veiculoId = parseInt(req.params.veiculo_id);
    const { nome_categoria, descricao } = req.body as z.infer<typeof CategoriaVeiculoSchema>;
    
    const categoriaRepository = getConnection().getRepository(Categoria);
    const categoriaVeiculoRepository = getConnection().getRepository(CategoriaVeiculo);
    
    // Buscar ou criar categoria
    let categoria = await categoriaRepository.findOne({
      where: { nome: nome_categoria },
    });
    
    if (!categoria) {
      categoria = categoriaRepository.create({
        nome: nome_categoria,
        desc: descricao || "",
      });
      categoria = await categoriaRepository.save(categoria);
    }
    
    // Verificar se a combinação já existe
    const existing = await categoriaVeiculoRepository.findOne({
      where: {
        categoria_id: categoria.id,
        veiculo_id: veiculoId,
      },
    });
    
    if (existing) {
      return res.status(400).json({
        detail: "A combinação de categoria e veículo já existe",
      });
    }
    
    // Criar relacionamento
    const categoriaVeiculo = categoriaVeiculoRepository.create({
      categoria_id: categoria.id,
      veiculo_id: veiculoId,
    });
    await categoriaVeiculoRepository.save(categoriaVeiculo);
    
    const repository = getConnection().getRepository(Veiculo);
    const updatedCategoria = await repository
      .createQueryBuilder("veiculo")
      .leftJoinAndSelect("veiculo.categorias", "categoria")
      .where("veiculo.id = :id", { id: veiculoId })
      .getOne();
    
    res.status(201).json(updatedCategoria);
  } catch (error) {
    res.status(500).json({ error: "Erro ao associar categoria ao veículo" });
  }
});

export default router;
