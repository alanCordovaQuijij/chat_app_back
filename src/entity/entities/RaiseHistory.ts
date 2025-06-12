import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("raise_history_pkey", ["id"], { unique: true })
@Entity("raise_history", { schema: "public" })
export class RaiseHistory {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("date", { name: "date", nullable: true })
  date: string | null;

  @Column("integer", { name: "employee_id", nullable: true })
  employeeId: number | null;

  @Column("numeric", {
    name: "base_salary",
    nullable: true,
    precision: 8,
    scale: 2,
  })
  baseSalary: string | null;

  @Column("numeric", { name: "amount", nullable: true, precision: 8, scale: 2 })
  amount: string | null;

  @Column("numeric", {
    name: "percentage",
    nullable: true,
    precision: 4,
    scale: 2,
  })
  percentage: string | null;
}
