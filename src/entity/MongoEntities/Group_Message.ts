import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { User } from './Personas';

@Entity({ name: 'Group_Message' })
export class GroupMessage {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    group_id: string;

    @Column()
    user_id: string;

    // @Column()
    // user: User;

    @Column()
    message: string;

    @Column()
    type: "TEXT" | "IMAGE";

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;

    @Column()
    estado: boolean;

    constructor(
        group_id: string,
        user_id: string,
        message: string,
        type: "TEXT" | "IMAGE",
        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
        estado: boolean = true,

    ) {
        this.group_id = group_id,
        this.user_id = user_id,
        this.message = message,
        this.type = type,
        //this.user = user,
        this.createdAt = createdAt,
        this.updatedAt = updatedAt,
        this.estado = estado
    }
}