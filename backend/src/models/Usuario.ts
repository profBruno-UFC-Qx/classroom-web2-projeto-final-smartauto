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

  @Column({ nullable: true })
  telefone?: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  uf?: string;

  @Column({ nullable: true })
  cidade?: string;

  @Column({ nullable: true })
  logradouro?: string;

  @Column({ nullable: true })
  numero?: number;

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
