import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Usuario } from "./Usuario";
import { Veiculo } from "./Veiculo";

export enum StatusLocacao {
  PENDENTE = "pendente",
  APROVADA = "aprovada",
  RECUSADA = "recusada",
}

@Entity("locacao")
export class Locacao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date" })
  data_inicio!: Date;

  @Column({ type: "date" })
  data_fim!: Date;

  @Column()
  cliente_id!: number;

  @Column({ nullable: true })
  locador_id!: number | null;

  @Column()
  veiculo_id!: number;

  @Column({
    type: "varchar",
    length: 20,
    default: StatusLocacao.PENDENTE,
  })
  status!: StatusLocacao;

  @ManyToOne(() => Usuario, (usuario) => usuario.locacoesComoLocador, { nullable: true })
  @JoinColumn({ name: "locador_id" })
  locador!: Usuario | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.locacoesComoCliente)
  @JoinColumn({ name: "cliente_id" })
  cliente!: Usuario;

  @ManyToOne(() => Veiculo, (veiculo) => veiculo.locacoes)
  @JoinColumn({ name: "veiculo_id" })
  veiculo!: Veiculo;
}
