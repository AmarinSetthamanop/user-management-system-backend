import { PrismaClient } from '@prisma/client'
import role from "./seed/role_data"
import permission from './seed/permission_data';
import role_permission from './seed/role_permission_data';
import user from './seed/user_data';
import user_token from './seed/user_token_data';

// สร้าง object ของ prisma เพื่อชื่องต่อ Database (SQLite)
const prisma = new PrismaClient()


async function main() {

    // insert ข้อมูล
    await prisma.role.createMany({
        data: role
    });

    await prisma.permission.createMany({
        data: permission
    });

    await prisma.role_Permission.createMany({
        data: role_permission
    });

    await prisma.user.createMany({
        data: user
    });

    // await prisma.user_Token.createMany({
    //     data: user_token
    // });

}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())

