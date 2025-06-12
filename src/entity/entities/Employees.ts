import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dependents } from "./Dependents";
import { Departments } from "./Departments";
import { Jobs } from "./Jobs";

@Index("employees_pkey", ["employeeId"], { unique: true })
@Entity("employees", { schema: "public" })
export class Employees extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "employee_id" })
  employeeId: number;

  @Column("character varying", {
    name: "first_name",
    nullable: true,
    length: 20,
    default: () => "NULL::character varying",
  })
  firstName: string | null;

  @Column("character varying", { name: "last_name", length: 25 })
  lastName: string;

  @Column("character varying", { name: "email", length: 100 })
  email: string;

  @Column("character varying", {
    name: "phone_number",
    nullable: true,
    length: 20,
    default: () => "NULL::character varying",
  })
  phoneNumber: string | null;

  @Column("date", { name: "hire_date" })
  hireDate: string;

  @Column("numeric", { name: "salary", precision: 8, scale: 2 })
  salary: string;

  @OneToMany(() => Dependents, (dependents) => dependents.employee)
  dependents: Dependents[];

  @ManyToOne(() => Departments, (departments) => departments.employees, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "department_id", referencedColumnName: "departmentId" }])
  department: Departments;

  @ManyToOne(() => Jobs, (jobs) => jobs.employees, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "job_id", referencedColumnName: "jobId" }])
  job: Jobs;

  @ManyToOne(() => Employees, (employees) => employees.employees)
  @JoinColumn([{ name: "manager_id", referencedColumnName: "employeeId" }])
  manager: Employees;

  @OneToMany(() => Employees, (employees) => employees.manager)
  employees: Employees[];
}
