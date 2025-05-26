// hashed password ด้วย (bcrypt)
import bcrypt from 'bcrypt';

// จำนวนรอบของการ เพิ่มความซับซ้อน การเข้ารหัส
const SALT_ROUNDS = 10;

// แฮชรหัสผ่านก่อนบันทึกลงฐานข้อมูล
export async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

// ตรวจสอบว่า plaintext password ตรงกับ hashed password หรือไม่
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
