// สำหรับสร้าง api
import express from "express";


import { generateAccessToken , verifyAccessToken } from "../utils/jwt"


// export ให้ router สามารถไปใช้งานในไฟล์อื่นได้
// สร้าง object ของ Router ที่อยู่ใน expresss
// express.Router คือ สร้างเส้นทางต่างๆ หรือ api ต่างๆ สำหรับ get, post, put, delete
export const router = express.Router();

router.get('/', async (request, response)=>{

    const payload = {
        user_id: 1,
        role_id: 1,
    }

    const accessToken = generateAccessToken(payload);

    const verifyToken = verifyAccessToken(accessToken);

    response
        .cookie('ThisIsCookie', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/login'
        })
        .send({
            "text": "Hi I am is Get in test.ts",
            "accessToken": accessToken,
            "verifyToken": verifyToken
        });
});