import { Router } from "express";
import { add_user, delete_user, edit_me, edit_user, get_user, get_users, register, reset_password } from "../controllers/user.controller";

// export ให้ router สามารถไปใช้งานในไฟล์อื่นได้
// สร้าง object ของ Router ที่อยู่ใน expresss
// express.Router คือ สร้างเส้นทางต่างๆ หรือ api ต่างๆ สำหรับ get, post, put, delete
const router = Router();

// enpoint สำหรับ register
router.post('/register', register);

// enpoint สำหรับ register
router.post('/add_user', add_user);

// enpoint สำหรับ ดึงข้อมูล users ทั้งหมด ตาม filter ที่กำหนด
router.get('/get_users', get_users);

// enpoint สำหรับ ดึงข้อมูล user ด้วย id
router.get('/get_user', get_user);

// enpoint สำหรับแก้ไขข้อมูล user ด้วย id
router.put('/edit_user', edit_user);

// enpoint สำหรับลบข้อมูล user ด้วย id
router.delete('/delete_user', delete_user);

// enpoint สำหรับแก้ไขข้อมูล profile ตัวเอง
router.put('/edit_me', edit_me);

// enpoint สำหรับ reset password
router.put('/reset_password', reset_password);

// ส่งอกกตัวแปล router ให้ใช้งานร่วมกันใน main
export default router;


