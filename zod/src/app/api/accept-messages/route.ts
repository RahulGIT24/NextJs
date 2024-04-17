import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth"

export async function POST(request: Request) {
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

        const userId = user?._id
        const {acceptMessages} = await request.json()

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessage:acceptMessages},
            {new:true}
        )

        if(!updatedUser){
            return Response.json({
                success: false,
                message: "Failed to update user"
            },
                { status: 401 }
            )
        }

        return Response.json({
            success: true,
            message: "Message Acceptance Status update successfully",
            updatedUser
        },
            { status: 200 }
        )

    } catch (error) {
        return Response.json({
            success: false,
            message: "Failed to update user status to accept messages"
        },
            { status: 500 }
        )
    }
}

export async function GET(request:Request){
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userId = session?.user._id;
    try {
        const user = await UserModel.findById(userId);
        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            },
                { status: 404 }
            )
        }
        return Response.json({
            success: true,
            isAcceptingMessage: user.isAcceptingMessage
        },
            { status: 200 }
        )
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error while checking..."
        },
            { status: 500 }
        )
    }
}