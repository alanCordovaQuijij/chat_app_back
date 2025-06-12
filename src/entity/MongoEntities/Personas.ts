import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';

@Entity({ name: 'personas' })
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  password: string;

  @Column()
  avatar: string;

  @Column()
  email: string;

  @Column()
  estado: boolean;

  constructor(
    firstname: string,
    lastname: string,
    password: string,
    avatar: string | null = null,
    email: string,
    estado: boolean = true
  ) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.password = password;
    this.avatar = avatar;
    this.email = email;
    this.estado = estado
  }
}