import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Usuario } from "../models/Usuario";
import { Veiculo } from "../models/Veiculo";
import { Categoria } from "../models/Categoria";
import { Locacao } from "../models/Locacao";
import { CategoriaVeiculo } from "../models/CategoriaVeiculo";

// Carregar variáveis do arquivo .env
dotenv.config();

// Configuração do banco de dados
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./smartauto.db",
  synchronize: true, // Cria/atualiza tabelas automaticamente
  logging: false,
  entities: [
    Usuario,
    Veiculo,
    Categoria,
    Locacao,
    CategoriaVeiculo,
  ],
});

// Inicializa o banco de dados e cria as tabelas
export async function createDbAndTables(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    
    // Habilitar foreign keys no SQLite
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.query("PRAGMA foreign_keys=ON");
    await queryRunner.release();
    
    console.log("Banco de dados SQLite inicializado");
  }
}

// Obter conexão do banco de dados
export function getConnection(): DataSource {
  if (!AppDataSource.isInitialized) {
    throw new Error("Database not initialized. Call createDbAndTables() first.");
  }
  return AppDataSource;
}
