/**
 * Migrado de Python para TypeScript
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Categoria } from "./Categoria";
import { Locacao } from "./Locacao";

export enum Ordem {
  ASC = "asc",
  DESC = "desc",
}

@Entity("veiculo")
export class Veiculo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  marca!: string;

  @Column()
  modelo!: string;

  @Column()
  ano!: number;

  @Column()
  cor!: string;

  @Column()
  disponivel!: boolean;

  @Column("real")
  valor_diaria!: number;

  @ManyToMany(() => Categoria, (categoria) => categoria.veiculos)
  @JoinTable({
    name: "categoria_veiculo",
    joinColumn: { name: "veiculo_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "categoria_id", referencedColumnName: "id" },
  })
  categorias!: Categoria[];

  @OneToMany(() => Locacao, (locacao) => locacao.veiculo)
  locacoes!: Locacao[];
}
