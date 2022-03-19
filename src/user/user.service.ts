import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import * as uuid from 'uuid'
import { CreateUserDto } from "./dto/createUser.dto";
import { UserResponseInteface } from "./types/responseUser.inteface";
import { sign } from 'jsonwebtoken'
import { JWT_SECRET } from "@app/config";
import { LoginUserDto } from "./dto/loginUser.dto";
import { compare } from 'bcrypt'

@Injectable()
export default class UserService {
  constructor (
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  generateActivationCode(): string {
    return uuid.v4()
  }

  async generateActivationLink(id: number): Promise<string> {
    const user = await this.findById(id)
    return `http://${process.env.SERVER_API}/activate/${user.activationLink}`
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const candidateLogin = await this.userRepository.findOne({login: createUserDto.login})
    const candidateEmail = await this.userRepository.findOne({email: createUserDto.email})
    const candidateUsername = await this.userRepository.findOne({username: createUserDto.username})

    if (candidateLogin || candidateEmail || candidateUsername) {
      throw new HttpException('Credintailas are not valid', HttpStatus.FORBIDDEN)
    }

    const candidate = new UserEntity()

    Object.assign(candidate, createUserDto)

    candidate.refreshToken = this.generateJWToken(candidate, 30)

    candidate.activationLink = this.generateActivationCode()

    return await this.userRepository.save(candidate)
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({login: loginUserDto.login}, {
      select: ['id', 'username', 'login', 'password', 'bio', 'email', 'isEmailVerificate', 'photo', 'refreshToken', 'vkId', 'yandexId']
    })

    if (!user) {
      throw new HttpException('Credintails are not valid', HttpStatus.FORBIDDEN)
    }

    const isPasswordCorrect = compare(loginUserDto.password, user.password)

    if (!isPasswordCorrect) { throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY) }

    delete user.password

    return user
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne(id)
    if (!user) {
      throw new HttpException('Credintailas are not valid', HttpStatus.FORBIDDEN)
    }

    return user
  }

  generateJWToken(user: UserEntity, expire: number): string {
    return sign({
      id: user.id,
      email: user.email,
      login: user.login,
      timestamp: new Date(),
      expire: new Date().setDate(new Date().getDate() + expire)
    }, JWT_SECRET)
  }

  buildResponse(user: UserEntity): UserResponseInteface {
    return {
      user: {
        ...user,
        accessToken: this.generateJWToken(user, 15)
      }
    }
  }
}