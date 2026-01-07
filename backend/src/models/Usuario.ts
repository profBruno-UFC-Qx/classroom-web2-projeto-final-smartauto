import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { Locacao } from "./Locacao";

export enum Role {
  CLIENTE = "cliente",
  LOCADOR = "locador",
  ADMIN = "admin",
}

@Entity("usuario")
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  usuario!: string;

  @Column()
  senha!: string;

  @Column()
  nome!: string;

  @Column()
  telefone!: string;

  @Column()
  email!: string;

  @Column()
  uf!: string;

  @Column()
  cidade!: string;

  @Column()
  logradouro!: string;

  @Column()
  numero!: number;

  @Column({
    type: "varchar",
    length: 20,
  })
  role!: Role;

  @OneToMany(() => Locacao, (locacao) => locacao.cliente)
  locacoesComoCliente!: Locacao[];

  @OneToMany(() => Locacao, (locacao) => locacao.locador)
  locacoesComoLocador!: Locacao[];
}
