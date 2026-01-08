import { Router, Request, Response } from "express";
import { getConnection } from "../database/database";
import { Veiculo } from "../models/Veiculo";
import { Categoria } from "../models/Categoria";
import { CategoriaVeiculo } from "../models/CategoriaVeiculo";

const router = Router();
// POST /veiculos
router.post("/", async (req: Request, res: Response) => {
  try {
    const repository = getConnection().getRepository(Veiculo);
    const veiculo = repository.create(req.body);
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
      .andWhere("(:categoria IS NULL OR categoria.nome = :categoria)", { categoria });
    
    const veiculos = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();
    
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar veículos" });
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

// PUT /veiculos/:veiculo_id
router.put("/:veiculo_id", async (req: Request, res: Response) => {
  try {
    const veiculoId = parseInt(req.params.veiculo_id);
    const repository = getConnection().getRepository(Veiculo);
    const dbVeiculo = await repository.findOne({ where: { id: veiculoId } });
    
    if (!dbVeiculo) {
      return res.status(404).json({ detail: "Veículo não encontrado" });
    }
    
    // Atualizar campos
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && key !== "id") {
        (dbVeiculo as any)[key] = req.body[key];
      }
    });
    
    const updatedVeiculo = await repository.save(dbVeiculo);
    res.json(updatedVeiculo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar veículo" });
  }
});

// DELETE /veiculos/:veiculo_id
router.delete("/:veiculo_id", async (req: Request, res: Response) => {
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

// POST /veiculos/categoria/:veiculo_id
router.post("/categoria/:veiculo_id", async (req: Request, res: Response) => {
  try {
    const veiculoId = parseInt(req.params.veiculo_id);
    const { nome_categoria, descricao } = req.body;
    
    const categoriaRepository = getConnection().getRepository(Categoria);
    const veiculoRepository = getConnection().getRepository(Veiculo);
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
