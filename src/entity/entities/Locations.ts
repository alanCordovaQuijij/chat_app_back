import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Departments } from "./Departments";
import { Countries } from "./Countries";

@Index("locations_pkey", ["locationId"], { unique: true })
@Entity("locations", { schema: "public" })
export class Locations {
  @PrimaryGeneratedColumn({ type: "integer", name: "location_id" })
  locationId: number;

  @Column("character varying", {
    name: "street_address",
    nullable: true,
    length: 40,
    default: () => "NULL::character varying",
  })
  streetAddress: string | null;

  @Column("character varying", {
    name: "postal_code",
    nullable: true,
    length: 12,
    default: () => "NULL::character varying",
  })
  postalCode: string | null;

  @Column("character varying", { name: "city", length: 30 })
  city: string;

  @Column("character varying", {
    name: "state_province",
    nullable: true,
    length: 25,
    default: () => "NULL::character varying",
  })
  stateProvince: string | null;

  @OneToMany(() => Departments, (departments) => departments.location)
  departments: Departments[];

  @ManyToOne(() => Countries, (countries) => countries.locations, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "country_id", referencedColumnName: "countryId" }])
  country: Countries;
}
