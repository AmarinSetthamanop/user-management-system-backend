import { Request, Response } from 'express';
import { service_login, service_logout } from '../services/auth.service';


// endpoint สำหรับ รับ request login จาก client
export const login = async (req: Request, res: Response) => {

    // ดึงข้อมูลจาก request body
    const body = {
        email: req.body.email,
        password: req.body.password,
    }

    // ส่งข้อมูล body ให้กับ service สำหรับ login
    const result = await service_login(body.email, body.password);

    // ถ้า login ไม่สำเร็จ
    if ( !( ('status' in result) ? result.status : result.data.status ) ) {
        res.status(422).json(result);
    }
    // ถ้า login สำเร็จ
    else {
        res
            // บันทึก cookie ให้กับ client ในชื่อ accessToken
            .cookie('accessToken', ('accessToken' in result ? result.accessToken : null), {
                httpOnly: true, // ป้องกัน XSS (ไม่ให้ JavaScript เข้าถึง cookie นี้)
                secure: true,   // ใช้เฉพาะบน HTTPS
                sameSite: 'strict', // ป้องกัน CSRF
                maxAge: 2 * 24 * 60 * 60 * 1000, // อายุ 2 วัน
                path: '/',   // Cookie จะถูกใช้งานได้ทุก endpoints
            })
            .status(200)
            .json('data' in result ? result.data : result.result);
            
    }

};




// endpoint สำหรับ รับ request logout จาก client
export const logout = async (req: Request, res: Response) => {

    // ดึง cookie ตัวแปล accessToken จากการ request
    const accessToken = req.cookies.accessToken;

    // เรียกใช้ method logout
    const result = await service_logout(accessToken);

    // ถ้ายังไม่ login
    if ( !(result.status) ) {
        res.status(422).json(result);
    }
    // ออกจากระบบได้
    else {
        res
            .clearCookie('accessToken') // clear ค่าใน cookie ของ client
            .status(200)
            .json(result);
    }
};

