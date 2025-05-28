import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from 'cookie-parser'

// path ของ endpoint ต่างๆ
import authRoutes from './src/routes/auth.route';
import userRoutes from './src/routes/user.route';
import roleRoutes from './src/routes/role.route';

const app = express();

//********************************** CORS API ******************************/
// CORS คือ เมื่อเรานำ project fount-end และ back-end ขึ้นสู่ระบบ hosting ภายนอก แล้วเราต้องการให้ fount-end สามารถเรียก back-end ได้นั้น จึงต้องทำ cors
app.use(cors({
    origin: [
        "*",
        "http://localhost:3000",
    ],
    credentials: true // รับ cookie จาก client
}));



//************************************** ตัวจัดการข้อมูลที่ส่งมาทาง body **************************************/
// ตัวจัดการ body ที่ส่งมาทาง url ถ้าส่งมาแบบ text หรือ ส่งมาแบบ json
app.use(bodyParser.text());
app.use(bodyParser.json());

// middleware ที่ช่วย แปลง cookie ที่มาจาก client เป็น json
app.use(cookieParser());

// กำหนด path เริ่มต้นของระบบ โดยทำงานในที่อยู่ endpoint สำหรับยืนยันตัวตนของระบบ
app.use('/auth', authRoutes);

// กำหนด path สำหรับการทำงานของ userr
app.use('/user', userRoutes);

// กำหนด path เริ่มต้นสำหรับข้อมูล table role
app.use('/role', roleRoutes);

// Test api
app.get('/', (req: Request, res: Response) => {
    res.status(200).send({ test: "Hi ser" });
});



// ส่งอกกตัวแปล ให้ใช้งานร่วมกันใน main
export default app;