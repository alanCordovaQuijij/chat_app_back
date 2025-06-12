import { Entity, ObjectIdColumn, Column, ObjectId } from "typeorm";
import { User } from "./Personas";
import { v4 as uuidV4 } from "uuid";

@Entity({ name: "ParticipantGroup" })
export class ParticipantGroup {
  @Column({ generated: "uuid" })
  _id: string;

  @Column()
  user_id: string;

  @Column()
  estado: boolean;

  @Column()
  createdAt: Date;

  constructor(
    user_id: string,
    _id: string = uuidV4(),
    createdAt: Date = new Date(),
    estado: boolean = true
  ) {
    this._id = _id;
    this.user_id = user_id;
    this.createdAt = createdAt;
    this.estado = estado;
  }
}
