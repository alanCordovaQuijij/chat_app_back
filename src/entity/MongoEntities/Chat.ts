import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { User } from './Personas';

@Entity({ name: 'Chat' })
export class Chat {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    participant_one: string;

    @Column()
    participant_two: string;

    @Column()
    estado: boolean;

    constructor(
        participant_one: string,
        participant_two: string,
        estado: boolean = true
    ) {
        this.participant_one = participant_one
        this.participant_two = participant_two
        this.estado = estado
    }
}