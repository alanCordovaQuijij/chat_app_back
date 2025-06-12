import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { User } from './Personas';

@Entity({ name: 'Chat_Message' })
export class ChatMessage {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    chat_id: string;

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
        chat_id: string,
        user_id: string,
        message: string,
        type: "TEXT" | "IMAGE",
        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
        estado: boolean = true,

    ) {
        this.chat_id = chat_id,
        this.user_id = user_id,
        this.message = message,
        this.type = type,
        //this.user = user,
        this.createdAt = createdAt,
        this.updatedAt = updatedAt,
        this.estado = estado
    }
}