// ตัวอ่าน .env
import dotenv from 'dotenv'

// กำหนดให้สามารถอ่านค่าใน .env
dotenv.config()

// object สำหรับเรียกใช้งานค่าใน .env
export const config = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  databaseUrl: process.env.DATABASE_URL!,
};
