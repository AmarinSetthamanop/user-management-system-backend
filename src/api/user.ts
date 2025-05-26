// สำหรับสร้าง api
import express from "express";

import { hashPassword, comparePassword } from "../utils/hashing";

// export ให้ router สามารถไปใช้งานในไฟล์อื่นได้
// สร้าง object ของ Router ที่อยู่ใน expresss
// express.Router คือ สร้างเส้นทางต่างๆ หรือ api ต่างๆ สำหรับ get, post, put, delete
export const router = express.Router();



// สมัครสามาชิก
router.get('/register', async (request, response)=>{

    const password = '12345';
    const hashed = await hashPassword(password);
    const compare = await comparePassword(password, "$2b$10$e.gxYLyYJp0cKFPK49apGu52l4br07Ky5sFIQCiYwe19KM0qof6LS");

    response.send({
        "text": "Hi I am is Get in test.ts",
        "password": password,
        "hached": hashed,
        "compare": compare

    });


});