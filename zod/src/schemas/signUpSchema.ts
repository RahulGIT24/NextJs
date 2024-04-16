import {z} from "zod"

export const userNameValidation = z
    .string()
    .min(2,"Username must be atleast 2 characters")
    .max(20,"Must be less than 20")
    .regex(/^[a-zA-Z0-9_]$/,"Username must not contain special character")

export const signUpSchema = z.object({
    username:userNameValidation,
    email:z.string().email({message:"Invalid Email address"}),
    password:z.string().min(8,{message:"Password must be atleast 6 characters"}),
})