import { IsNotEmpty, IsString } from 'class-validator'

class BaseAuthDto {
  @IsNotEmpty()
  @IsString()
  readonly loginOrEmail: string

  @IsNotEmpty()
  @IsString()
  readonly password: string
}

export { BaseAuthDto }
