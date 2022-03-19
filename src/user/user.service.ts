import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import uuid from 'uuid'

@Injectable()
export default class UserService {
  constructor (
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async generateActivationLink(id: number): Promise<string> {
    return `http://${process.env.SERVER_API}/activate/${uuid.v4()}`
  }
}