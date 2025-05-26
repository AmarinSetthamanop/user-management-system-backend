import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

// ตรวจสอบสิทธิ์การใช้งาน route ต่างๆ
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.send({ "message": "คุณไม่มี token หรือยังไม่ login จากการเรียกใช้ API เส้นนี้" }).sendStatus(401);

    try {
        const payload = verifyAccessToken(token);
        (req as any).user = payload;
        // อนุญาตให้ทำงานต่อได้
        next();
    }
    catch {
        res
        .send({
            "message": "คุณไม่มีสิทธิ์ใช้งาน API เส้นนี้"
        })
        .sendStatus(403);
    }
}
