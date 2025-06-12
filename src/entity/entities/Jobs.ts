import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Employees } from "./Employees";

@Index("jobs_pkey", ["jobId"], { unique: true })
@Entity("jobs", { schema: "public" })
export class Jobs {
  @PrimaryGeneratedColumn({ type: "integer", name: "job_id" })
  jobId: number;

  @Column("character varying", { name: "job_title", length: 35 })
  jobTitle: string;

  @Column("numeric", {
    name: "min_salary",
    nullable: true,
    precision: 8,
    scale: 2,
    default: () => "NULL::numeric",
  })
  minSalary: string | null;

  @Column("numeric", {
    name: "max_salary",
    nullable: true,
    precision: 8,
    scale: 2,
    default: () => "NULL::numeric",
  })
  maxSalary: string | null;

  @OneToMany(() => Employees, (employees) => employees.job)
  employees: Employees[];
}
