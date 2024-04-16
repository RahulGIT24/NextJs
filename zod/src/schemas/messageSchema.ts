import {z} from "zod"

export const messageSchema = z.object({
    content:z.string().min(10,{message:"Content Must be atleast of 10 characters"}).max(300,{message:"Content Must be no longer than characters"})
})