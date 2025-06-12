import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Employees } from "./Employees";

@Index("dependents_pkey", ["dependentId"], { unique: true })
@Entity("dependents", { schema: "public" })
export class Dependents {
  @PrimaryGeneratedColumn({ type: "integer", name: "dependent_id" })
  dependentId: number;

  @Column("character varying", { name: "first_name", length: 50 })
  firstName: string;

  @Column("character varying", { name: "last_name", length: 50 })
  lastName: string;

  @Column("character varying", { name: "relationship", length: 25 })
  relationship: string;

  @ManyToOne(() => Employees, (employees) => employees.dependents, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "employee_id", referencedColumnName: "employeeId" }])
  employee: Employees;
}
