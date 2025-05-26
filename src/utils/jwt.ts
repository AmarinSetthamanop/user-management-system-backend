// json-web-token สำหรับการยืนยันตัวตน
import jwt from 'jsonwebtoken'
import { config } from '../config/env'

// สร้าง JWT โดยใช้ id ของ user คนนั้นๆ และ secret key ของระบบ
export function generateAccessToken(payload: object) {
  return jwt.sign(payload, config.accessTokenSecret, { expiresIn: '2d' }) // และกำหนดอายุการใช้งานของ token นั้นๆ
}

// ตรวจสอบ token ที่ user ส่งมาให้ ว่าเป็นของที่ระบบนี้ออกให้หรือไม่
export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.accessTokenSecret)
}
