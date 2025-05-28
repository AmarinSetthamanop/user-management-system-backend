import { Request, Response } from 'express';
import { service_add_user, service_delete_user, service_edit_me, service_edit_user, service_get_user, service_get_users, service_register, service_reset_password } from '../services/user.service';


// endpoint สำหรับ รับ request register จาก client
export const register = async (req: Request, res: Response) => {
    
    // ดึงข้อมูลจาก request body
    const body = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    }

    // เรียกใช้ service register เพื่อบันทึกข้อมูล
    const result = await service_register(body.name, body.email, body.password);

    res.status(200).send(result);

};



// endpoint สำหรับ รับ request add_user จาก client
export const add_user = async (req: Request, res: Response) => {

    // ดึงข้อมูลจาก request body
    const body = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phone_number,
        image: req.body.image,
        status: req.body.status,
        role_id: req.body.role_id,
    }

    // ดึง cookie ตัวแปล accessToken จากการ request
    const accessToken = req.cookies.accessToken;

    // เรียกใช้ service add_user เพื่อบันทึกข้อมูล
    const result = await service_add_user(
        body.name,
        body.email,
        body.password,
        body.phone_number,
        body.image,
        body.status,
        body.role_id,
        accessToken
    );

    res.status(200).send(result);
};



// endpoint สำหรับ รับ request get_users จาก client
export const get_users = async (req: Request, res: Response) => {

    // ดึงของมูล filter ที่ต้องการค้นหาจาก params
    const params = {
        title: (req.query.title as string || '').trim().replace(/\s+/g, ' '),
        role_id: req.query.role_id || undefined,
        status: req.query.status || undefined
    };

    // ดึง cookie ตัวแปล accessToken จากการ request
    const accessToken = req.cookies.accessToken;

    // เรียกใช้ service get_users เพื่อดึงข้อมูล ตาม filter
    const result = await service_get_users(
        params.title,
        Number(params.role_id),
        params.status === 'true' ? true : params.status === 'false' ? false : undefined,
        accessToken
    );

    res.status(200).send(result);
};




// endpoint สำหรับ รับ request get_user จาก client
export const get_user = async (req: Request, res: Response) => {
    
    // ดึงของมูลจาก params
    const params = {
        user_id: Number(req.query.user_id)
    };

    // ดึง cookie ตัวแปล accessToken จากการ request
    const accessToken = req.cookies.accessToken;

    // เรียกใช้ service get_user เพื่อดึงข้อมูล user ตาม id
    const result = await service_get_user(params.user_id, accessToken);

    res.status(200).send(result);

};




// endpoint สำหรับ รับ request edit_user จาก client
export const edit_user = async (req: Request, res: Response) => {

    // ดึงของมูลจาก body
    const body = {
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phone_number,
        image: req.body.image,
        status: req.body.status,
        role_id: req.body.role_id,
    };

    // ดึง cookie ตัวแปล accessToken จากการ request
    const accessToken = req.cookies.accessToken;

    // เรียกใช้ service edit_user เพื่อแก้ไขข้อมูล user ด้วย id
    const result = await service_edit_user(
        body.id,
        body.name,
        body.email,
        body.password,
        body.phone_number,
        body.image,
        body.status,
        body.role_id,
        accessToken
    );

    res.status(200).send(result);

};



// endpoint สำหรับ รับ request delete_user จาก client
export const delete_user = async (req: Request, res: Response) => {

    // ดึงของมูลจาก params
    const params = {
        user_id: Number(req.query.user_id)
    };

    // ดึง cookie ตัวแปล accessToken จากการ request
    const accessToken = req.cookies.accessToken;

    // เรียกใช้ service get_user เพื่อดึงข้อมูล user ตาม id
    const result = await service_delete_user(params.user_id, accessToken);

    res.status(200).send(result);

};



// endpoint สำหรับ รับ request edit_me จาก client
export const edit_me = async (req: Request, res: Response) => {

    // ดึงของมูลจาก body
    const body = {
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phone_number,
        image: req.body.image,
    };

    // ดึง cookie ตัวแปล accessToken จากการ request
    const accessToken = req.cookies.accessToken;

    // เรียกใช้ service แก้ไขข้อมูล Profile ตัวเอง
    const result = await service_edit_me(
        body.id,
        body.name,
        body.email,
        body.password,
        body.phone_number,
        body.image,
        accessToken
    );

    res.status(200).send(result);

}



// endpoint สำหรับ รับ request edit_me จาก client
export const reset_password = async (req: Request, res: Response) => {
    // ดึงของมูลจาก body
    const body = {
        email: req.body.email,
        password: req.body.password,
    };

    // เรียกใช้ service แก้ไข password
    const result = await service_reset_password( body.email, body.password );

    res.status(200).send(result);
}