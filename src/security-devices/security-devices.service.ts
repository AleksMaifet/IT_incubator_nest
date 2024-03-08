import { Injectable } from '@nestjs/common'

@Injectable()
export class SecurityDevicesService {
  constructor() {}

  public mapTimeStampsToDB({
    issuedAt,
    expirationAt,
  }: {
    issuedAt: number
    expirationAt: number
  }) {
    const generateLocale = (value: number) => {
      return new Date(value * 1000)
    }

    return {
      iat: generateLocale(issuedAt),
      exp: generateLocale(expirationAt),
    }
  }
}
