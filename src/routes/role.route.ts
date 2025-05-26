import { Router } from "express";
import { get_role } from "../controllers/role.controller";

// export ให้ router สามารถไปใช้งานในไฟล์อื่นได้
// สร้าง object ของ Router ที่อยู่ใน expresss
// express.Router คือ สร้างเส้นทางต่างๆ หรือ api ต่างๆ สำหรับ get, post, put, delete
const router = Router();

// enpoint สำหรับ register
router.get('/get_role', get_role);

// ส่งอกกตัวแปล router ให้ใช้งานร่วมกันใน main
export default router;