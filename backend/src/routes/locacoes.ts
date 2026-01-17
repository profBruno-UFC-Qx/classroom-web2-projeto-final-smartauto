import { Router, Request, Response } from "express";
import { getConnection } from "../database/database";
import { Locacao, StatusLocacao } from "../models/Locacao";
import { Veiculo } from "../models/Veiculo";
import { Usuario, Role } from "../models/Usuario";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";
import { validate } from "../middleware/validate";

const router = Router();

const LocacaoSchema = z.object({
  data_inicio: z.date(),
  data_fim: z.date(),
  cliente_id: z.number(),
  locador_id: z.number(),
  veiculo_id: z.number(),
});

const LocacaoUpdateSchema = z.object({
  data_inicio: z.date().optional(),
  data_fim: z.date().optional(),
  cliente_id: z.number().optional(),
  locador_id: z.number().optional(),
  veiculo_id: z.number().optional(),
});

// Função auxiliar para calcular valor total da locação
function calcularValorTotal(dataInicio: Date, dataFim: Date, valorDiaria: number): number {
  const dias = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
  return dias * valorDiaria;
}

// Função auxiliar para remover dados sensíveis de usuários
function sanitizeUsuario(usuario: Usuario): Omit<Usuario, 'usuario' | 'senha'> {
  const { usuario: _, senha: __, ...usuarioLimpo } = usuario;
  return usuarioLimpo;
}

// Função auxiliar para sanitizar locação completa removendo dados sensíveis de usuários e campos cliente_id, locador_id e veiculo_id
function sanitizeLocacao(locacao: Locacao & { valor_total?: number }) {
  return {
    ...locacao,
    cliente_id: undefined,
    locador_id: undefined,
    veiculo_id: undefined,
    locador: sanitizeUsuario(locacao.locador),
    cliente: sanitizeUsuario(locacao.cliente),
  };
}

// GET /locacoes - Requer autenticação (todos os usuários autenticados)
router.get("/", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    
    const repository = getConnection().getRepository(Locacao);
    const locacoes = await repository
      .createQueryBuilder("locacao")
      .leftJoinAndSelect("locacao.locador", "locador")
      .leftJoinAndSelect("locacao.cliente", "cliente")
      .leftJoinAndSelect("locacao.veiculo", "veiculo")
      .skip(offset)
      .take(limit)
      .getMany();
    
    // Adicionar valor_total calculado para cada locação
    const locacoesComValorTotal = locacoes.map((locacao) => {
      const valorTotal = calcularValorTotal(
        new Date(locacao.data_inicio),
        new Date(locacao.data_fim),
        locacao.veiculo.valor_diaria
      );
      return {
        ...locacao,
        valor_total: valorTotal,
      };
    });
    
    res.json(locacoesComValorTotal.map(sanitizeLocacao));
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar locações" });
  }
});

// GET /locacoes/me - Retorna apenas locações do usuário logado (se for CLIENTE)
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    
    const repository = getConnection().getRepository(Locacao);
    const locacoes = await repository
      .createQueryBuilder("locacao")
      .leftJoinAndSelect("locacao.locador", "locador")
      .leftJoinAndSelect("locacao.cliente", "cliente")
      .leftJoinAndSelect("locacao.veiculo", "veiculo")
      .where("locacao.cliente_id = :clienteId", { clienteId: req.user.id })
      .skip(offset)
      .take(limit)
      .getMany();
    
    // Adicionar valor_total calculado para cada locação
    const locacoesComValorTotal = locacoes.map((locacao) => {
      const valorTotal = calcularValorTotal(
        new Date(locacao.data_inicio),
        new Date(locacao.data_fim),
        locacao.veiculo.valor_diaria
      );
      return {
        ...locacao,
        valor_total: valorTotal,
      };
    });
    
    res.json(locacoesComValorTotal.map(sanitizeLocacao));
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar locações" });
  }
});

// POST /locacoes - Requer autenticação (todos os usuários autenticados)
router.post("/", requireAuth, validate({ body: LocacaoSchema }), async (req: Request, res: Response) => {
  try {
    const { data_inicio, data_fim, cliente_id, locador_id, veiculo_id } = req.body;
    
    const veiculoRepository = getConnection().getRepository(Veiculo);
    const usuarioRepository = getConnection().getRepository(Usuario);
    const locacaoRepository = getConnection().getRepository(Locacao);
    
    // Verificar veículo
    const veiculo = await veiculoRepository
      .createQueryBuilder("veiculo")
      .where("veiculo.id = :id", { id: veiculo_id })
      .andWhere("veiculo.disponivel = :disponivel", { disponivel: true })
      .getOne();
    
    if (!veiculo) {
      return res.status(404).json({ detail: "Veículo não encontrado" });
    }
    
    // Verificar locador (deve ser LOCADOR ou ADMIN)
    const locador = await usuarioRepository.findOne({
      where: { id: locador_id },
    });
    if (!locador) {
      return res.status(404).json({ detail: "Locador não encontrado" });
    }
    if (locador.role !== Role.LOCADOR && locador.role !== Role.ADMIN) {
      return res.status(403).json({ detail: "Locador deve ter role LOCADOR ou ADMIN" });
    }
    
    // Verificar cliente
    const cliente = await usuarioRepository.findOne({
      where: { id: cliente_id },
    });
    if (!cliente) {
      return res.status(404).json({ detail: "Cliente não encontrado" });
    }
    
    // Criar locação com status PENDENTE
    const dataInicio = new Date(data_inicio);
    const dataFim = new Date(data_fim);
    const locacao = locacaoRepository.create({
      data_inicio: dataInicio,
      data_fim: dataFim,
      cliente_id,
      locador_id,
      veiculo_id,
      status: StatusLocacao.PENDENTE,
    });
    const savedLocacao = await locacaoRepository.save(locacao);
    
    // Veículo permanece disponível até a locação ser aprovada
    
    // Adicionar valor_total calculado na resposta
    const valorTotal = calcularValorTotal(dataInicio, dataFim, veiculo.valor_diaria);
    const resposta = {
      ...savedLocacao,
      valor_total: valorTotal,
    };
    
    res.status(201).json(resposta);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar locação" });
  }
});

// GET /locacoes/:id - Requer autenticação (todos os usuários autenticados)
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const repository = getConnection().getRepository(Locacao);
    const locacao = await repository.findOne({
      where: { id },
      relations: ["locador", "cliente", "veiculo"],
    });
    
    if (!locacao) {
      return res.status(404).json({ detail: "Locação não encontrada" });
    }
    
    // Adicionar valor_total calculado na resposta
    const valorTotal = calcularValorTotal(
      new Date(locacao.data_inicio),
      new Date(locacao.data_fim),
      locacao.veiculo.valor_diaria
    );
    const resposta = {
      ...locacao,
      valor_total: valorTotal,
    };
    
    res.json(sanitizeLocacao(resposta));
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar locação" });
  }
});

// PUT /locacoes/:id - Requer autenticação e role LOCADOR ou ADMIN
router.put("/:id", requireAuth, validate({ body: LocacaoUpdateSchema }), requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const repository = getConnection().getRepository(Locacao);
    const dbLocacao = await repository.findOne({ where: { id } });
    
    if (!dbLocacao) {
      return res.status(404).json({ detail: "Locação não encontrada" });
    }
    
    // Atualizar campos
    Object.assign(dbLocacao, req.body);
    
    const updatedLocacao = await repository.save(dbLocacao);
    
    // Recarregar com relacionamentos para calcular valor_total
    const locacaoCompleta = await repository.findOne({
      where: { id: updatedLocacao.id },
      relations: ["locador", "cliente", "veiculo"],
    });
    
    if (locacaoCompleta) {
      const valorTotal = calcularValorTotal(
        new Date(locacaoCompleta.data_inicio),
        new Date(locacaoCompleta.data_fim),
        locacaoCompleta.veiculo.valor_diaria
      );
      const resposta = {
        ...locacaoCompleta,
        valor_total: valorTotal,
      };
      res.json(sanitizeLocacao(resposta));
    } else {
      res.json(updatedLocacao);
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar locação" });
  }
});

// PUT /locacoes/:id/aprovar - Requer autenticação e role LOCADOR ou ADMIN
router.put("/:id/aprovar", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const repository = getConnection().getRepository(Locacao);
    const veiculoRepository = getConnection().getRepository(Veiculo);
    
    const locacao = await repository.findOne({
      where: { id },
      relations: ["locador", "cliente", "veiculo"],
    });
    
    if (!locacao) {
      return res.status(404).json({ detail: "Locação não encontrada" });
    }
    
    // Validar que locação está pendente
    if (locacao.status !== StatusLocacao.PENDENTE) {
      return res.status(400).json({ 
        detail: `Locação não pode ser aprovada. Status atual: ${locacao.status}` 
      });
    }
    
    // Atualizar status para APROVADA
    locacao.status = StatusLocacao.APROVADA;
    const savedLocacao = await repository.save(locacao);
    
    // Marcar veículo como indisponível
    if (locacao.veiculo) {
      locacao.veiculo.disponivel = false;
      await veiculoRepository.save(locacao.veiculo);
    }
    
    // Recarregar com relacionamentos para calcular valor_total
    const locacaoCompleta = await repository.findOne({
      where: { id: savedLocacao.id },
      relations: ["locador", "cliente", "veiculo"],
    });
    
    if (locacaoCompleta) {
      const valorTotal = calcularValorTotal(
        new Date(locacaoCompleta.data_inicio),
        new Date(locacaoCompleta.data_fim),
        locacaoCompleta.veiculo.valor_diaria
      );
      const resposta = {
        ...locacaoCompleta,
        valor_total: valorTotal,
      };
      res.json(sanitizeLocacao(resposta));
    } else {
      res.json(savedLocacao);
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao aprovar locação" });
  }
});

// PUT /locacoes/:id/recusar - Requer autenticação e role LOCADOR ou ADMIN
router.put("/:id/recusar", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const repository = getConnection().getRepository(Locacao);
    
    const locacao = await repository.findOne({
      where: { id },
      relations: ["locador", "cliente", "veiculo"],
    });
    
    if (!locacao) {
      return res.status(404).json({ detail: "Locação não encontrada" });
    }
    
    // Validar que locação está pendente
    if (locacao.status !== StatusLocacao.PENDENTE) {
      return res.status(400).json({ 
        detail: `Locação não pode ser recusada. Status atual: ${locacao.status}` 
      });
    }
    
    // Atualizar status para RECUSADA
    locacao.status = StatusLocacao.RECUSADA;
    const savedLocacao = await repository.save(locacao);
    
    // Veículo permanece disponível (não alterar)
    
    // Recarregar com relacionamentos para calcular valor_total
    const locacaoCompleta = await repository.findOne({
      where: { id: savedLocacao.id },
      relations: ["locador", "cliente", "veiculo"],
    });
    
    if (locacaoCompleta) {
      const valorTotal = calcularValorTotal(
        new Date(locacaoCompleta.data_inicio),
        new Date(locacaoCompleta.data_fim),
        locacaoCompleta.veiculo.valor_diaria
      );
      const resposta = {
        ...locacaoCompleta,
        valor_total: valorTotal,
      };
      res.json(sanitizeLocacao(resposta));
    } else {
      res.json(savedLocacao);
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao recusar locação" });
  }
});

// DELETE /locacoes/:id - Requer autenticação e role LOCADOR ou ADMIN
router.delete("/:id", requireAuth, requireRole([Role.LOCADOR, Role.ADMIN]), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const repository = getConnection().getRepository(Locacao);
    const locacao = await repository.findOne({ where: { id } });
    
    if (!locacao) {
      return res.status(404).json({ detail: "Locação não encontrada" });
    }
    
    // Liberar veículo apenas se locação estiver aprovada
    if (locacao.status === StatusLocacao.APROVADA) {
      const veiculoRepository = getConnection().getRepository(Veiculo);
      const veiculo = await veiculoRepository.findOne({
        where: { id: locacao.veiculo_id },
      });
      if (veiculo) {
        veiculo.disponivel = true;
        await veiculoRepository.save(veiculo);
      }
    }
    
    await repository.remove(locacao);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover locação" });
  }
});

export default router;
