import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from "typeorm";
import { Veiculo } from "./Veiculo";

@Entity("categoria")
export class Categoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  desc!: string;

  @ManyToMany(() => Veiculo, (veiculo) => veiculo.categorias)
  veiculos!: Veiculo[];
}
