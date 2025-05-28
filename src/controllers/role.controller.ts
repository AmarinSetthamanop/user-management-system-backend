import { Request, Response } from 'express';
import { service_get_role } from '../services/role.service';


// endpoint สำหรับ รับ request add_user จาก client
export const get_role = async (req: Request, res: Response) => {

    // ดึง cookie ตัวแปล accessToken จากการ request
    const accessToken = req.cookies.accessToken;

    // เรียกใช้ service add_user เพื่อบันทึกข้อมูล
    const result = await service_get_role( accessToken );

    res.status(200).send(result);
};