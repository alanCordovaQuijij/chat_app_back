import { Entity, ObjectIdColumn, Column, ObjectId } from "typeorm";
import { User } from "./Personas";
import { ParticipantGroup } from "./ParticipantesGrupo";

@Entity({ name: "Group" })
export class Group {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  creator: string;

  @Column()
  participants: ParticipantGroup[];

  @Column()
  estado: boolean;

  @Column()
  createdAt: Date;

  constructor(
    name: string,
    image: string,
    creator: string,
    participants: ParticipantGroup[] = [],
    estado: boolean = true,
    createdAt: Date = new Date()
  ) {
    this.name = name;
    this.image = image;
    this.creator = creator;
    this.participants = participants;
    this.estado = estado;
    this.createdAt = createdAt
  }
}
