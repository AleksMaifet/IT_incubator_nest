interface IRefreshTokenMeta {
  issuedAt: Date
  expirationAt: Date
  deviceId: string
  clientIp: string
  deviceName: string
  userId: string
}

export { IRefreshTokenMeta }
