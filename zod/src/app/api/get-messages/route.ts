import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from "@/model/User"
import mongoose from "mongoose";

export async function GET(request:Request){
    await dbConnect();
    try {
        const session = await getServerSession(authOptions)
        const user: User = session?.user as User

        if (!session || !session?.user) {
            return Response.json({
                success: false,
                message: "Error while verifying code"
            },
                { status: 401 }
            )
        }

        const userId = new mongoose.Types.ObjectId(user._id);

        const user_ = await UserModel.aggregate([
            {$match : {id:userId}},
            {$unwind: '$messages'},
            {$sort: {'messages.createdAt':-1}},
            {$group: {_id: '$_id', messages:{$push: '$messages'}}}
        ])

        if(!user_ || user_.length  === 0){
            return Response.json({
                success:false,
                message:"User not Found"
            },{
                status:404
            })
        }

        return Response.json({
            success:true,
            messages:user_[0].messages
        },{
            status:200
        })

    } catch (error) {
        return Response.json({
            success:false,
            message:"Error while getting messages"
        },{
            status:500
        })
    }
}