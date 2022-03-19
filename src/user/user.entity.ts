import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { hash } from 'bcrypt'

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  username: string

  @Column()
  login: string

  @Column({ select: false })
  password: string

  @Column()
  email: string

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10)
  }

  @Column()
  refreshToken: string

  @Column({ default: null })
  bio: string

  @Column({default: null})
  photo: string

  @Column({ default: false })
  isEmailVerificate: boolean

  @Column()
  activationLink: string

  @Column({ default: null })
  acceptCode: string

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string

  @Column({ type: 'simple-json', default: null })
  yandexId: string

  @Column({ type: 'simple-json', default: null })
  vkId: string
}