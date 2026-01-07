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
    const disponiveis = req.query.disponiveis !== "false";
    
    const repository = getConnection().getRepository(Veiculo);
    const queryBuilder = repository.createQueryBuilder("veiculo");
    
    if (disponiveis) {
      queryBuilder.where("veiculo.disponivel = :disponivel", { disponivel: true });
    }
    
    const veiculos = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();
    
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar veículos" });
  }
});

// GET /veiculos/veiculo-com-categoria/
router.get("/veiculo-com-categoria/", async (req: Request, res: Response) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const disponiveis = req.query.disponiveis !== "false";
    
    const repository = getConnection().getRepository(Veiculo);
    const queryBuilder = repository
      .createQueryBuilder("veiculo")
      .leftJoinAndSelect("veiculo.categorias", "categoria");
    
    if (disponiveis) {
      queryBuilder.where("veiculo.disponivel = :disponivel", { disponivel: true });
    }
    
    const veiculos = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();
    
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar veículos com categoria" });
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

// GET /veiculos/categoria/:categoria
router.get("/categoria/:categoria", async (req: Request, res: Response) => {
  try {
    const categoriaNome = req.params.categoria;
    const repository = getConnection().getRepository(Veiculo);
    
    const veiculos = await repository
      .createQueryBuilder("veiculo")
      .innerJoin("veiculo.categorias", "categoria")
      .where("categoria.nome = :nome", { nome: categoriaNome })
      .getMany();
    
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículos por categoria" });
  }
});

// GET /veiculos/preco/
router.get("/preco/", async (req: Request, res: Response) => {
  try {
    const minPreco = parseFloat(req.query.min_preco as string) || 0;
    const maxPreco = parseFloat(req.query.max_preco as string) || 1000000;
    
    const repository = getConnection().getRepository(Veiculo);
    const veiculos = await repository
      .createQueryBuilder("veiculo")
      .where("veiculo.preco BETWEEN :minPreco AND :maxPreco", { minPreco, maxPreco })
      .getMany();
    
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículos por preço" });
  }
});

// GET /veiculos/ano/:ano
router.get("/ano/:ano", async (req: Request, res: Response) => {
  try {
    const ano = parseInt(req.params.ano);
    const repository = getConnection().getRepository(Veiculo);
    const veiculos = await repository.find({
      where: { ano },
    });
    
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículos por ano" });
  }
});

// GET /veiculos/modelo/:modelo
router.get("/modelo/:modelo", async (req: Request, res: Response) => {
  try {
    const modelo = req.params.modelo;
    const repository = getConnection().getRepository(Veiculo);
    const veiculos = await repository.find({
      where: { modelo },
    });
    
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículos por modelo" });
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
