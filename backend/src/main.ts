import "reflect-metadata";
import express, { Request, Response } from "express";
import { createDbAndTables } from "./database/database";
import authRouter from "./routes/auth";
import categoriasRouter from "./routes/categorias";
import usuariosRouter from "./routes/usuarios";
import veiculosRouter from "./routes/veiculos";
import locacoesRouter from "./routes/locacoes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());

// Rota raiz
app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "SmartAutoApp" });
});

// Registrar rotas
app.use("/auth", authRouter);
app.use("/categorias", categoriasRouter);
app.use("/usuarios", usuariosRouter);
app.use("/veiculos", veiculosRouter);
app.use("/locacoes", locacoesRouter);

// Inicializar banco de dados e iniciar servidor
async function startServer() {
  try {
    await createDbAndTables();
    console.log("Banco de dados inicializado com sucesso");
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao inicializar servidor:", error);
    process.exit(1);
  }
}

startServer();
