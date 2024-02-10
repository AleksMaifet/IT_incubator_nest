import { IUser } from './interfaces'

class User implements IUser {
  public readonly id: string
  public readonly createdAt: Date

  constructor(
    public readonly login: string,
    public readonly email: string,
    public readonly passwordSalt: string,
    public readonly passwordHash: string,
  ) {
    this.createdAt = new Date()
  }
}

export { User }
