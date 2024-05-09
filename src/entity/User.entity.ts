import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from "typeorm"

@Entity({ name: 'users' })
@Unique(["email"])
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false })
    email: string

    @Column({ nullable: false })
    password: string

    @Column({ default: 'user' })
    role: string

    @Column({ default: true })
    active: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
