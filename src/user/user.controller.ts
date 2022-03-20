import { Body, Controller, Get, Param, Post, Put, Query, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { User } from "./decorators/user.decorator";
import { CreateUserDto } from "./dto/createUser.dto";
import { LoginUserDto } from "./dto/loginUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { AuthGuard } from "./guards/auth.guard";
import { UserResponseInteface } from "./types/responseUser.inteface";
import { UserEntity } from "./user.entity";
import UserService from "./user.service";
import { Response } from "express";
import { CreateUserOAuthDto } from "./dto/createUserOAuth.dto";

@Controller('user')
export default class UserController {
  constructor (
    private readonly userServise: UserService
  ) {}

  @Post('activation')
  @UseGuards(AuthGuard)
  async sendActivationLink(@User('id') id: number, @User('email') email: string): Promise<string> {
    return await this.userServise.sendActiovationLink(id, email)
  }

  @Get('activation/:code')
  async activateEmail(@Param('code') code: string): Promise<UserResponseInteface> {
    const user = await this.userServise.activateEmail(code)
    return this.userServise.buildResponse(user)
  }

  @Post('accept')
  @UseGuards(AuthGuard)
  async sendAcceptCode(@User('id') id: number): Promise<{accept: {status: string, email: string}}> {
    const accept = await this.userServise.sendAcceptCode(id)
    return {
      accept
    }
  }

  @Post('accept/:code')
  @UseGuards(AuthGuard)
  async validateCode(@User('id') id: number, @Param('code') code: string): Promise<{accessToken: string}> {
    return await this.userServise.validateAcceptCode(id, code)
  }


  @Post('registration')
  @UsePipes(new ValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInteface> {
    const user = await this.userServise.createUser(createUserDto)
    return this.userServise.buildResponse(user)
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginUser(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInteface> {
    const user = await this.userServise.loginUser(loginUserDto)
    return this.userServise.buildResponse(user)
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(@User('id') id: number, @Body('user') updateUserDto: UpdateUserDto): Promise<UserResponseInteface> {
    const user =  await this.userServise.updateUser(updateUserDto, id)
    return this.userServise.buildResponse(user)
  }

  @Get('oauth/verify?:code')
  async getAccessTokenFromVK(@Query('code') code: string, @Res() res: Response): Promise<any> {
    const tokenVK = await this.userServise.getAccessTokenFromVK(code)
    const candidate = await this.userServise.getFiledsFromVK(tokenVK)
    res.redirect(`http://localhost:8080/lk/oauth/vk?${new URLSearchParams(candidate).toString()}`)
  }

  @Post('oauth')
  async oauthWithService(@Body('user') candidate: CreateUserOAuthDto): Promise<UserResponseInteface> {
    const user = await this.userServise.oauthWithservices(candidate)
    return this.userServise.buildResponse(user)
  }
}