import { PrismaClient } from '@prisma/client';
import { PayloadModel, ResultModel } from '../models/auth.interface';
import { verifyAccessToken } from '../utils/jwt';

// object ของ Prisma สำหรับแก้ไข database
const prisma = new PrismaClient();


//======================================================== service การดึงข้อมูล role
export async function service_get_role( token: string ) {

    // ข้อมูลที่จะส่งกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    try {

        // แปลง token ของ client เป็น object ( {user_id : ...} )
        const decoded = verifyAccessToken(token) as PayloadModel;

        // ตรวจสอบว่าผู้ใช้ที่ request มานั้น ได้เป็นสมาชิกในระบบหรือไม่
        const check_user = await prisma.user.findUnique({
            where: { id: decoded.user_id },
        });

        // ถ้าผู้ใช้คนนี้ไม่ได้เป็นสมาชิกของระบบ
        if ( !check_user ) {
            data.message = 'ไม่พบข้อมูลของคุณ หรือผู้ร้องขอข้อมูล';
            return data;
        }


        // ดึงข้อมูล role
        const role = await prisma.role.findMany({
            select: {
                id: true,
                name: true
            }
        });

        data.status = true;
        data.result = role;
        return data;

    } catch (error) {
        data.message = 'คุณยังไม่ได้เข้าสู่ระบบ';
        return data;
    }
}