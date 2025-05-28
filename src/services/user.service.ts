import { PrismaClient } from '@prisma/client';
import { PayloadModel, ResultModel } from '../models/auth.interface';
import { hashPassword, comparePassword } from '../utils/hashing';
import { verifyAccessToken } from '../utils/jwt';

// object ของ Prisma สำหรับแก้ไข database
const prisma = new PrismaClient();


//======================================================== service การ register สมัครสมาชิก
export async function service_register(name: string, email: string, password: string, role_id = 2) {

    // ข้อมูลทีจะสงกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };
    
    // ถ้ากรอกข้อมูลมาไม่ครบ
    if (!name.trim() || !email.trim() || !password.trim()) {
        data.message = 'กรอกข้อมูลไม่ครบ name | email | password';
        return data;
    }   

    // ตรวจสอบว่า email นี้ถูกสมัครไว้แล้วหรือยัง
    const check_mail = await prisma.user.findUnique({
        where: { email: email },
        select: { email: true }
    });
    
    // ถ้า email นี้ถูกสมัครไว้แล้ว
    if ( check_mail ) {
        data.message = 'Email นี้ถูกใช้งานแล้ว';
        return data;
    }

    // บันทึกข้อมูล user
    const createdUser = await prisma.user.create({
        data: {
            role_id: role_id,
            name: name,
            email: email,
            password: await hashPassword(password), // เข้ารหัส password
        }
    });
    await prisma.user.update({
        where: { id: createdUser.id },
        data: {
            created_by: createdUser.id,
            updated_by: createdUser.id
        }
    });

    data.status = true;
    data.message = 'สมัครสมาชิกเสร็จสิ้น';
    return data;
}



//======================================================== service การเพิ่มข้อมูล user
export async function service_add_user(
    name: string,
    email: string,
    password: string,
    phone_number: string | undefined,
    image: Uint8Array<ArrayBufferLike> | null,
    status: boolean,
    role_id: number,
    token: string // ยืนยันตัวตนผู้ใช้ที่เป็น damin
) {

    // ข้อมูลที่จะส่งกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    // ถ้ากรอกข้อมูลมาไม่ครบ
    if (
        !name.trim() ||
        !email.trim() ||
        !password.trim() ||
        !role_id
    ) {
        data.message = 'กรอกข้อมูลไม่ครบ name | email | password | status | role_id';
        return data;
    }  

    try {
    
        // แปลง token ของ client เป็น object ( {user_id : ...} )
        const decoded = verifyAccessToken(token) as PayloadModel;

        // ค้นหาข้อมูลของผู้ใช้คนนี้ด้วย id ของเขาเอง
        const check_is_admin = await prisma.user.findUnique({
            where: { id: decoded.user_id },
            include: {
                role: { 
                    select: { name: true }
                 }
            }
        });

        // ถ้าไม่พบข้อมูลผู้ใช้
        if ( !(check_is_admin) ) {
            data.message = 'ไม่พบข้อมูลของคุณใน cookie หรือ database';
            return data;
        }

        // ถ้าไม่ใช่ Admin
        if ( check_is_admin.role?.name !== "Admin" ) {
            data.message = 'ไม่พบบทบาทของคุณ หรือคุณไม่ใช่ Admin';
            return data;
        }


        // ตรวจสอบ email ของผู้ใช้ที่ต้องการเพิ่มใหม่
        const check_mail = await prisma.user.findUnique({
            where: { email: email },
            select: { email: true }
        });
        // ถ้า email นี้ถูกสมัครไว้แล้ว
        if ( check_mail ) {
            data.message = 'Email นี้ถูกใช้งานแล้ว';
            return data;
        }

        // ตรวจสอบ phone_number ของผู้ใช้ที่ต้องการเพิ่มใหม่
        const check_phoneNumber = await prisma.user.findUnique({
            where: { phone_number: phone_number },
            select: { phone_number: true }
        });
        // ถ้าเบอร์มือถือถูกใช้งานแล้ว
        if ( check_phoneNumber ) {
            data.message = 'เบอร์มือถือนี้ถูกใช้งานแล้ว';
            return data;
        }


        // เพิ่มข้อมูลผู้ใช้คนใหม่
        await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: await hashPassword(password),
                phone_number: phone_number,
                image: image,
                status: status,
                created_by: check_is_admin.id,
                updated_by: check_is_admin.id,
                role_id: role_id
            }
        });

        data.status = true;
        data.message = 'เพิ่มข้อมูลผู้ใช้คนใหม่เรียบร้อย'
        return data;
    }
    catch {
        data.message = 'คุณยังไม่ได้เข้าสู่ระบบ';
        return data;
    }
}




//======================================================== service ดึงข้อมูล users ทั้งหมด
export async function service_get_users( title = '', role_id: number | undefined, status: boolean | undefined, token: string ) {

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

        // ดึงข้อมูล users ท้ังหมด
        let users = await prisma.user.findMany({
            include: {
                role: true
            }
        });

        // filter ข้อมูลตามที่ต้องการค้นหา
        users = users.filter(user =>
            user.name?.toLowerCase().includes(title.toLowerCase()) ||
            user.email?.toLowerCase().includes(title.toLowerCase())
        ).filter(user =>
            (role_id ? user.role_id === role_id : true) &&
            (typeof status === 'boolean' ? user.status === status : true)
        );

        // ข้อมูลเรียงที่จะสงกลับไป
        data = {
            status: true,
            message: '',
            result: users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                image: user.image,
                status: user.status,
                last_login: user.last_login,
                created_at: user.created_at,
                updated_at: user.updated_at,
                created_by: user.created_by,
                updated_by: user.updated_by,
                role_name: user.role?.name,
            }))
        };

        return data;

    } catch (error) {
        data.message = 'คุณยังไม่ได้เข้าสู่ระบบ';
        return data;
    }

}



//======================================================== service ดึงข้อมูล user ด้วย id ของ user เอง
export async function service_get_user( user_id: number, token: string ) {
    
    // ข้อมูลที่จะส่งกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    try {

        // แปลง token ของ client เป็น object ( {user_id : ...} )
        const decoded = verifyAccessToken(token) as PayloadModel;

        // ตรวจสอบว่าผู้ใช้มี่ request มานั้น ได้เป็นสมาชิกในระบบหรือไม่
        const check_user = await prisma.user.findUnique({
            where: { id: decoded.user_id },
        });
        // ถ้าผู้ใช้คนนี้ไม่ได้เป็นสมาชิกของระบบ
        if ( !check_user ) {
            data.message = 'ไม่พบข้อมูลของคุณ หรือผู้ร้องขอข้อมูล';
            return data;
        }


        // ดึงข้อมูล user ด้วย id
        let user = await prisma.user.findUnique({
            where: { id: user_id },
            include: {
                role: {
                    include: {
                        role_permission: {
                            include: {
                                permission: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // ถ้าไม่่พบข้อมูลที่ต้องการค้นหาด้วย id
        if ( !user ) {
            data.message = 'ไม่พบข้อมูลผู้ใข้ที่ค้นหาด้วย id นี้';
            return data;
        }

        // ข้อมูลเรียงที่จะสงกลับไป
        data = {
            status: true,
            message: '',
            result: user ? {
                id: user.id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                image: user.image,
                status: user.status,
                last_login: user.last_login,
                created_at: user.created_at,
                updated_at: user.updated_at,
                created_by: user.created_by,
                updated_by: user.updated_by,
                role_name: user.role?.name,
                permission: user.role?.role_permission.map((i) => i.permission.name) || []
            } : null
        };

        return data;

    } catch (error) {
        data.message = 'คุณยังไม่ได้เข้าสู่ระบบ';
        return data;
    }
}



//======================================================== service แก้ไขข้อมูล user (ต้องเป็น Admin โดยได้จากการตรวจดู cookie)
export async function service_edit_user(
    id: number,
    name: string,
    email: string,
    password: string | undefined,
    phone_number: string | undefined,
    image: Uint8Array<ArrayBufferLike> | null,
    status: boolean,
    role_id: number,
    token: string // ยืนยันตัวตนผู้ใช้ที่เป็น damin
) {

    // ข้อมูลที่จะส่งกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    // ถ้ากรอกข้อมูลมาไม่ครบ
    if (
        !id ||
        !name.trim() ||
        !email.trim() ||
        !role_id
    ) {
        data.message = 'กรอกข้อมูลไม่ครบ id | name | email | status | role_id';
        return data;
    }  

    try {
    
        // แปลง token ของ client เป็น object ( {user_id : ...} )
        const decoded = verifyAccessToken(token) as PayloadModel;

        // ค้นหาข้อมูลของผู้ใช้คนนี้ด้วย id ของเขาเอง
        const is_im_admin = await prisma.user.findUnique({
            where: { id: decoded.user_id },
            include: {
                role: { 
                    select: { name: true }
                 }
            }
        });
        // ถ้าไม่พบข้อมูลผู้ใช้ (หรือตัวเรา)
        if ( !(is_im_admin) ) {
            data.message = 'ไม่พบข้อมูลของคุณใน cookie หรือ database';
            return data;
        }
        // ถ้าไม่ใช่ Admin
        if ( is_im_admin.role?.name !== "Admin" ) {
            data.message = 'ไม่พบบทบาทของคุณ หรือคุณไม่ใช่ Admin';
            return data;
        }



        // ตรวจสอบดูว่า user ที่จะถูกแก้ไขข้อมูลนี้ เป็น Admin หรือไม่ (Admin ไม่สามารถแก้ไขข้อมูลของกันและกันได้)
        const is_he_admin = await prisma.user.findUnique({
            where: { id: id },
            include: {
                role: { 
                    select: { name: true }
                 }
            }
        });
        // ถ้าไม่พบข้อมูลผู้ใช้ (หรือผู้ที่จะถูกแก้ไขข้อมูล)
        if ( !(is_he_admin) ) {
            data.message = 'ไม่พบผู้ที่จะถูกแก้ไขข้อมูลใน database';
            return data;
        }
        // ถ้าผู้ที่จะถูกแก้ไขข้อมูล มีบทบาทเป็น Admin ด้วยกัน จะไม่สามารถแก้ไขข้อมูลของเขาได้
        if ( is_he_admin.role?.name === "Admin" ) {
            data.message = 'ไม่สามารถแก้ไขข้อมูลผู้ที่มีบทบาทเป็น Admin ร่วมกันได้';
            return data;
        }


        // ตรวจสอบ email ของผู้ใช้ที่ต้องการแก้ไข 
        const check_mail = await prisma.user.findFirst({
            where: {
                email: email,
                id: { not: id } // ยกเว้น email เดิมของ user id นี้
            },
            select: { email: true }
        });
        // ถ้า email นี้ถูกสมัครไว้แล้ว
        if ( check_mail ) {
            data.message = 'Email นี้ถูกใช้งานแล้ว';
            return data;
        }

        // การ register ครั้งแรก phone_number ของคนอื่นจะเป็น null ด้วย
        // เพื่อป้องกันไม่ให้เกิดข้อผิดพลาดตอนที่ ไม่ได้ส่ง phone_number มาด้วย
        if (phone_number) {
            // ตรวจสอบ phone_number ของผู้ใช้ที่ต้องการแก้ไข
            const check_phoneNumber = await prisma.user.findFirst({
                where: {
                    phone_number: phone_number,
                    id: { not: id }, // ยกเว้น เบอร์ เดิมของ user id นี้
                },
                select: { phone_number: true }
            });
            // ถ้าเบอร์มือถือถูกใช้งานแล้ว
            if ( check_phoneNumber ) {
                data.message = 'เบอร์มือถือนี้ถูกใช้งานแล้ว';
                return data;
            }
        }
            

        data.message = 'แก้ไขข้อมูลผู้ใช้เรียบร้อย'

        // แก้ไขข้อมูลผู้ใช้ด้วย id ถ้าส่ง password ใหม่มาด้วย
        if (password) {
            await prisma.user.update({
                where: { id: id },
                data: {
                    name: name,
                    email: email,
                    password: await hashPassword(password),
                    phone_number: phone_number,
                    image: image,
                    status: status,
                    created_by: is_im_admin.id,
                    updated_by: is_im_admin.id,
                    role_id: role_id
                }
            });
            data.message = data.message + " | แก้ไข password";
        }
        else {
            await prisma.user.update({
                where: { id: id },
                data: {
                    name: name,
                    email: email,
                    // password: await hashPassword(password),
                    phone_number: phone_number,
                    image: image,
                    status: status,
                    created_by: is_im_admin.id,
                    updated_by: is_im_admin.id,
                    role_id: role_id
                }
            })
            data.message = data.message + " | ไม่ได้แก้ไข password";
        }

        data.status = true;
        return data;

    }
    catch {
        data.message = 'คุณยังไม่ได้เข้าสู่ระบบ';
        return data;
    }
}



//======================================================== service แก้ไขข้อมูล user (ต้องเป็น Admin โดยได้จากการตรวจดู cookie)
export async function service_delete_user( id: number, token: string ) {

    // ข้อมูลที่จะส่งกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    // ถ้ากรอกข้อมูลมาไม่ครบ
    if ( !id ) {
        data.message = 'กรอกข้อมูลไม่ครบ | id';
        return data;
    }  

    try {
    
        // แปลง token ของ client เป็น object ( {user_id : ...} )
        const decoded = verifyAccessToken(token) as PayloadModel;

        // ค้นหาข้อมูลของผู้ใช้คนนี้ด้วย id ของเขาเอง
        const is_im_admin = await prisma.user.findUnique({
            where: { id: decoded.user_id },
            include: {
                role: { 
                    select: { name: true }
                 }
            }
        });
        // ถ้าไม่พบข้อมูลผู้ใช้ (หรือตัวเรา)
        if ( !(is_im_admin) ) {
            data.message = 'ไม่พบข้อมูลของคุณใน cookie หรือ database';
            return data;
        }
        // ถ้าไม่ใช่ Admin
        if ( is_im_admin.role?.name !== "Admin" ) {
            data.message = 'ไม่พบบทบาทของคุณ หรือคุณไม่ใช่ Admin';
            return data;
        }



        // ตรวจสอบดูว่า user ที่จะถูกลบข้อมูลนี้ เป็น Admin หรือไม่ (Admin ไม่สามารถลบข้อมูลของกันและกันได้)
        const is_he_admin = await prisma.user.findUnique({
            where: { id: id },
            include: {
                role: { 
                    select: { name: true }
                 }
            }
        });
        // ถ้าไม่พบข้อมูลผู้ใช้ (หรือผู้ที่จะถูกอก้ไขข้อมูล)
        if ( !(is_he_admin) ) {
            data.message = 'ไม่พบผู้ที่จะถูกลบข้อมูลใน database';
            return data;
        }
        // ถ้าผู้ที่จะถูกลบข้อมูล มีบทบาทเป็น Admin ด้วยกัน จะไม่สามารถลบข้อมูลของเขาได้
        if ( is_he_admin.role?.name === "Admin" ) {
            data.message = 'ไม่สามารถลบข้อมูลผู้ที่มีบทบาทเป็น Admin ร่วมกันได้';
            return data;
        }


        // ลบข้อมูล user ด้วย id
        await prisma.user.delete({
            where: { id: id }
        });


        data.status = true;
        data.message = "ลบข้อมูล User เรียบร้อย";
        return data;

    }
    catch {
        data.message = 'คุณยังไม่ได้เข้าสู่ระบบ';
        return data;
    }
}



//======================================================== service แก้ไขข้อมูล profile ตัวเอง (ตรวจดู cookie ของผู้ request และ id ของ profile ที่จะแก้ไขว่าตรงกันหรือไม่)
export async function service_edit_me(
    id: number,
    name: string,
    email: string,
    password: string | undefined,
    phone_number: string | undefined,
    image: Uint8Array<ArrayBufferLike> | null,
    token: string // ยืนยันตัวตนผู้ใช้ที่เป็นสมาชิก
) {

    // ข้อมูลที่จะส่งกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    // ถ้ากรอกข้อมูลมาไม่ครบ
    if (
        !id ||
        !name.trim() ||
        !email.trim()
    ) {
        data.message = 'กรอกข้อมูลไม่ครบ id | name | email';
        return data;
    }  

    try {
    
        // แปลง token ของ client เป็น object ( {user_id : ...} )
        const decoded = verifyAccessToken(token) as PayloadModel;

        // ค้นหาข้อมูลของผู้ใช้คนนี้ด้วย id ของเขาเอง
        const is_user = await prisma.user.findUnique({
            where: { id: decoded.user_id }
        });
        // ถ้าไม่พบข้อมูลผู้ใช้ (หรือตัวเรา)
        if ( !(is_user) ) {
            data.message = 'ไม่พบข้อมูลของคุณใน cookie หรือ database';
            return data;
        }
        // ถ้า id ที่ login มานั้นไม่ตรงกันกับ Profile ที่จะทำการแก้ไข
        if ( is_user.id !== id ) {
            data.message = 'คุณไม่ใช่เจ้าของ Profile ที่จะทำการแก้ไขนี้';
            return data;
        }



        // ตรวจสอบ email ของผู้ใช้ที่ต้องการแก้ไข 
        const check_mail = await prisma.user.findFirst({
            where: {
                email: email,
                id: { not: id } // ยกเว้น email เดิมของ user id นี้
            },
            select: { email: true }
        });
        // ถ้า email นี้ถูกสมัครไว้แล้ว
        if ( check_mail ) {
            data.message = 'Email นี้ถูกใช้งานแล้ว';
            return data;
        }

        // การ register ครั้งแรก phone_number ของคนอื่นจะเป็น null ด้วย
        // เพื่อป้องกันไม่ให้เกิดข้อผิดพลาดตอนที่ ไม่ได้ส่ง phone_number มาด้วย
        if (phone_number) {
            // ตรวจสอบ phone_number ของผู้ใช้ที่ต้องการแก้ไข
            const check_phoneNumber = await prisma.user.findFirst({
                where: {
                    phone_number: phone_number,
                    id: { not: id }, // ยกเว้น เบอร์ เดิมของ user id นี้
                },
                select: { phone_number: true }
            });
            // ถ้าเบอร์มือถือถูกใช้งานแล้ว
            if ( check_phoneNumber ) {
                data.message = 'เบอร์มือถือนี้ถูกใช้งานแล้ว';
                return data;
            }
        }
            

        data.message = 'แก้ไขข้อมูลผู้ใช้เรียบร้อย'

        // แก้ไขข้อมูลผู้ใช้ด้วย id ถ้าส่ง password ใหม่มาด้วย
        if (password) {
            await prisma.user.update({
                where: { id: id },
                data: {
                    name: name,
                    email: email,
                    password: await hashPassword(password),
                    phone_number: phone_number,
                    image: image,
                    updated_by: decoded.user_id,
                }
            });
            data.message = data.message + " | แก้ไข password";
        }
        else {
            await prisma.user.update({
                where: { id: id },
                data: {
                    name: name,
                    email: email,
                    // password: await hashPassword(password),
                    phone_number: phone_number,
                    image: image,
                    updated_by: decoded.user_id,
                }
            })
            data.message = data.message + " | ไม่ได้แก้ไข password";
        }

        data.status = true;
        return data;

    }
    catch {
        data.message = 'คุณยังไม่ได้เข้าสู่ระบบ';
        return data;
    }
}




//======================================================== service แก้ไขข้อมูล profile ตัวเอง (ตรวจดู cookie ของผู้ request และ id ของ profile ที่จะแก้ไขว่าตรงกันหรือไม่)
export async function service_reset_password( email: string, password: string ) {

    // ข้อมูลทีจะสงกลับไป
    let data : ResultModel = {
        status: false,
        message: '',
        result: null
    };

    // ถ้ากรอกข้อมูลมาไม่ครบ
    if ( !email.trim() || !password.trim() ) {
        data.message = 'กรอกข้อมูลไม่ครบ  email | password';
        return data;
    }  

    // ตรวจสอบว่ามี email นี้หรือไม่
    const check_mail = await prisma.user.findUnique({
        where: { email: email },
        select: { email: true }
    });
    
    // ถ้าไม่มี email นี้ใน database
    if ( !check_mail ) {
        data.message = 'ไม่พบ Email ในระบบ';
        return data;
    }

    // แก้ไข password
    await prisma.user.update({
        where: { email: email },
        data: { password: await hashPassword(password) }
    });


    data.status = true;
    data.message = 'แก้ไข Password เสร็จสิ้น';
    return data;
}
