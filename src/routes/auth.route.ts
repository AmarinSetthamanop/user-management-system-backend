import { Router } from 'express';

import { login, logout } from '../controllers/auth.controller';

// export ให้ router สามารถไปใช้งานในไฟล์อื่นได้
// สร้าง object ของ Router ที่อยู่ใน expresss
// express.Router คือ สร้างเส้นทางต่างๆ หรือ api ต่างๆ สำหรับ get, post, put, delete
const router = Router();

// enpoint สำหรับ login
router.post('/login', login);

// enpoint สำหรับ logout (ไม่ใช้ /:id แต่ใช้ cookie ที่ได้จากการ login)
router.get('/logout', logout);

// ส่งอกกตัวแปล router ให้ใช้งานร่วมกันใน main
export default router;
