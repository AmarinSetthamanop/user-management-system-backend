
// Token / JWT / payload
export interface PayloadModel {
    user_id: number
}


// model ของรูปแบบข้อมูลที่ทำการส่งกลับไป
export interface ResultModel {
    status: boolean,
    message: string,
    result: any | null
}