/**
 * Tabela de relacionamento many-to-many entre Categoria e Veiculo
 * Migrado de Python para TypeScript
 */

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Categoria } from "./Categoria";
import { Veiculo } from "./Veiculo";

@Entity("categoria_veiculo")
export class CategoriaVeiculo {
  @PrimaryColumn()
  categoria_id!: number;

  @PrimaryColumn()
  veiculo_id!: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: "categoria_id" })
  categoria!: Categoria;

  @ManyToOne(() => Veiculo)
  @JoinColumn({ name: "veiculo_id" })
  veiculo!: Veiculo;
}
