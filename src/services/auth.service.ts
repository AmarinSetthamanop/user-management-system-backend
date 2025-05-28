import { PrismaClient } from '@prisma/client';
import { hashPassword ,comparePassword } from '../utils/hashing';
import { generateAccessToken, verifyAccessToken } from '../utils/jwt';
import { PayloadModel, ResultModel } from '../models/auth.interface';


// object ของ Prisma สำหรับแก้ไข database
const prisma = new PrismaClient();


//======================================================== service การ login เข้าสู่ระบบ
export async function service_login(email: string, password: string) {

    // ข้อมูลที่จะส่งกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    // ถ้ากรอกข้อมูลมาไม่ครบ
    if (!email.trim() || !password.trim()) {
        data.message = 'กรอกข้อมูลไม่ครบ email | password';
        return data;
    }  

    // ตรวจสอบข้อมูล user ด้วย email
    let check_user = await prisma.user.findUnique({
        where: { email },
        select: { id: true ,email: true, password: true }
    });
    
    // ถ้าไม่พบข้อมูล user
    if ( !check_user ) {
        data.message = 'Email นี้ไม่ถูกต้อง หรือยังไม่สมัครใช้งานกับระบบ';
        return data;
    }

    // ถ้าระหัสผานไม่ถูกต้อง
    if ( !(await comparePassword(password, check_user.password)) ) {
        data.message = 'Password ไม่ถูกต้อง';
        return data;
    }

    // update วันที่่ในการ login
    await prisma.user.update({
        where: { id: check_user.id },
        data: { last_login: new Date(Date.now())}
    })

    // หาข้อมูล user ด้วย email
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: {
                include: {
                    role_permission: {
                        include: {
                            permission: true
                        }
                    }
                }
            }
        }
    });

    // ข้อมูลเรียงที่จะสงกลับไป
    data = {
        status: true,
        message: '',
        result: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            phone_number: user.phone_number,
            image: user.image,
            status: user.status,
            last_login: user.last_login,
            created_at: user.created_at,
            updated_at: user.updated_at,
            created_by: user.created_by,
            updated_by: user.updated_by,
            role_name: user.role?.name,
            permission: user.role?.role_permission.map((i: any) => i.permission.name) || []
        } : null
    };

    // สร้าง token (JWT) ของ User ด้วย id ของเขาเอง
    const accessToken = generateAccessToken( { user_id: user!.id } as PayloadModel );

    // บันทึก token ของเขาไว้ใน SQLite (upsert จะ update ข้อมูลที่มีอยู่ ถ้าไม่มีจะเพิ่ม)
    await prisma.user_Token.upsert({
        where: { user_id: user!.id },
        update: {
            token: accessToken,
            // จำนวนมิลลิวินาทีใน 2 วันข้างหน้า (หมดอายุการใช้งาน)
            expired_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        create: {
            user_id: user!.id,
            token: accessToken,
            // จำนวนมิลลิวินาทีใน 2 วันข้างหน้า (หมดอายุการใช้งาน)
            expired_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
    });

    // ส่งกลับผลลัพท์ข้อมูล user และ token (JWT)
    return { data, accessToken };
}




//======================================================== service การ logout ออกจากระบบ
export async function service_logout(token: string) {

    // ข้อมูลที่จะส่งกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    try {

        // แปลง token ของ client เป็น object ( {user_id : ...} )
        const decoded = verifyAccessToken(token) as PayloadModel;

        // ลบ token ของ user คนนั้นๆ ออกจาก SQLite
        await prisma.user_Token.delete({
            where: { user_id: decoded.user_id}
        });

        data.status = true;
        data.message = 'ออกจากระบบแล้ว';
        return data;

    }
    catch {
        data.message = 'คุณยังไม่ได้เข้าสู่ระบบ';
        return data;
    }
}
