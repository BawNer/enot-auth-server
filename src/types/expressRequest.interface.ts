import { UsersEntity } from "@app/user/user.entity";
import {Request} from 'express'

export interface ExpressRequestInterface extends Request {
  user?: UsersEntity
}