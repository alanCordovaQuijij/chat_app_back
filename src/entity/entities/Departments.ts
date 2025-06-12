import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Locations } from "./Locations";
import { Employees } from "./Employees";

@Index("departments_pkey", ["departmentId"], { unique: true })
@Entity("departments", { schema: "public" })
export class Departments {
  @PrimaryGeneratedColumn({ type: "integer", name: "department_id" })
  departmentId: number;

  @Column("character varying", { name: "department_name", length: 30 })
  departmentName: string;

  @ManyToOne(() => Locations, (locations) => locations.departments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "location_id", referencedColumnName: "locationId" }])
  location: Locations;

  @OneToMany(() => Employees, (employees) => employees.department)
  employees: Employees[];
}
