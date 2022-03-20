import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import * as uuid from 'uuid'
import { CreateUserDto } from "./dto/createUser.dto";
import { UserResponseInteface } from "./types/responseUser.inteface";
import { sign } from 'jsonwebtoken'
import { JWT_SECRET } from "@app/config";
import { LoginUserDto } from "./dto/loginUser.dto";
import { compare } from 'bcrypt';
import { UpdateUserDto } from "./dto/updateUser.dto";
import * as nodemailer from "nodemailer";
import axios from "axios";
import { CreateUserOAuthDto } from "./dto/createUserOAuth.dto";


@Injectable()
export default class UserService {
  private transporter

  constructor (
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.YANDEX_HOST,
      port: process.env.YANDEX_PORT,
      secure: true,
      auth: {
        user: process.env.YANDEX_LOGIN_MAIL_SERVICE,
        pass: process.env.YANDEX_PASSWORD_MAIL_SERVICE
      }
    })
  }

  generateActivationCode(): string {
    return uuid.v4()
  }

  async generateActivationLink(id: number): Promise<string> {
    const user = await this.findById(id)
    const code = this.generateActivationCode()
    user.activationLink = code
    await this.userRepository.save(user)
    return `http://${process.env.SERVER_API}/user/activation/${code}`
  }

  async sendActiovationLink(id: number, email: string): Promise<string> {
    const activationLink = await this.generateActivationLink(id)

    await this.transporter.sendMail({
      from: process.env.YANDEX_LOGIN_MAIL_SERVICE,
      to: email,
      subject: 'Активация почты [Enot.Auth]',
      html: `
        <div>
          <h1>Для активации перейдите по ссылке:</h1>
          <a href="${activationLink}">Активировать!</a>
        </div>
      `
    })

    throw new HttpException('Success', HttpStatus.OK)
  }

  async activateEmail(code: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({activationLink: code})

    if (!user) {
      throw new HttpException('Bag request', HttpStatus.BAD_REQUEST)
    }

    user.activationLink = ''
    user.isEmailVerificate = true

    return await this.userRepository.save(user)
  }

  async sendAcceptCode(id: number): Promise<{status: string, email: string}> {
    const user = await this.findById(id)
    const code = this.generateActivationCode().split('-')[Math.floor(Math.random()*4)]
    user.acceptCode = code
    await this.userRepository.save(user)

    await this.transporter.sendMail({
      from: process.env.YANDEX_LOGIN_MAIL_SERVICE,
      to: user.email,
      subject: 'Проверочный код [Enot.Auth]',
      html: `
        <div>
          <h1>Проверочный код:</h1>
          <b>${code}</b>
        </div>
      `
    })

    return {
      status: 'Success',
      email: user.email
    }
  }

  async validateAcceptCode(id: number, code: string): Promise<{accessToken: string}> {
    const user = await this.findById(id)
    if (user.acceptCode !== code) {
      throw new HttpException('Code are not valid', HttpStatus.CONFLICT)
    }
    user.acceptCode = null
    await this.userRepository.save(user)

    return {
      accessToken: this.generateJWToken(user, 15)
    }
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

  async updateUser(updateUserDto: UpdateUserDto, id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne(id, {
      select: ['id', 'username', 'login', 'password', 'bio', 'email', 'isEmailVerificate', 'photo', 'refreshToken', 'vkId', 'yandexId']
    })

    const isPasswordCorrect = compare(updateUserDto.password, user.password)

    if (!isPasswordCorrect) { throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY) }

    Object.assign(user, updateUserDto)

    if (updateUserDto.hasOwnProperty('email')) {
      user.isEmailVerificate = false
    }

    return await this.userRepository.save(user)
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

  async getAccessTokenFromVK(code: string): Promise<string> {
    const link = `https://oauth.vk.com/access_token?client_id=${process.env.VK_APP_ID}&client_secret=${process.env.VK_APP_SECRET}&redirect_uri=http://localhost:3000/user/oauth/verify&code=${code}`
    const result = await axios.get(link)
    //https://oauth.vk.com/authorize?client_id=8108646&display=page&redirect_uri=http://localhost:3000/user/oauth/verify&scope=offline,profile,email&response_type=code&v=5.131
    return result.data
  }

  async getFiledsFromVK(tokenVK: any): Promise<any> {
    const {data} = await axios.get(`https://api.vk.com/method/account.getProfileInfo?owner_id=${tokenVK.user_id}&access_token=${tokenVK.access_token}&v=5.131`, {
      transformRequest: res => res,
      responseType: 'json'
    })
    return data.response
  }

  async oauthWithservices(candidate: CreateUserOAuthDto): Promise<UserEntity> {
    let user = null
    if (
      candidate.service == 'vk'
    ) {
      const users = await this.userRepository.find({vkId: Not(IsNull())})
      users.forEach(userDB => {
        user = userDB.vkId.owner_id == candidate.owner_id ? userDB : null
      })
    }

    if (
      candidate.service == 'yandex'
    ) {
      const users = await this.userRepository.find({yandexId: Not(IsNull())})
      users.forEach(userDB => {
        user = userDB.yandexId.owner_id == candidate.owner_id ? userDB : null
      })
    }

    if (!user) {
      user = new UserEntity()
      if (candidate.service == 'vk') {
        Object.assign(user, {
          username: `vk_user_${candidate.owner_id}`,
          bio: candidate.bio,
          vkId: {
            owner_id: candidate.owner_id,
            accessToken: candidate.accessToken
          }
        })
      } else {
        Object.assign(user, {
          username: `yandex_user_${candidate.owner_id}`,
          bio: candidate.bio,
          vkId: {
            owner_id: candidate.owner_id,
            accessToken: candidate.accessToken
          }
        })
      }
      return this.userRepository.save(user)
    } else {
      return user
    }
  }
}