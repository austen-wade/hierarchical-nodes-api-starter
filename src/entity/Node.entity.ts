import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, UpdateDateColumn } from "typeorm"

@Entity({ name: 'nodes' })
@Tree("closure-table")
export class Node {

  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  name: string

  @TreeParent()
  parent: Node

  @Column({ nullable: true })
  parentId: number

  @TreeChildren()
  children: Node[]

  @Column({ nullable: false })
  type: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}