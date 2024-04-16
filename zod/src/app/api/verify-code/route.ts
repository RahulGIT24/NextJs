import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, code } = await request.json();
        // const decodedUsername = decodeURIComponent(username)

        const user = await UserModel.findOne({username})
        if (!user) {
            return Response.json({
                success: false,
                message: "User is not there"
            }, { status: 404 })
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (!isCodeValid) {
            return Response.json({
                success: false,
                message: "Invalid code"
            },
                { status: 400 }
            )
        }

        if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Code Expired"
            },
                { status: 400 }
            )
        }

        user.isVerified = true;
        await user.save();

        return Response.json({
            success: true,
            message: "User verified"
        },
            { status: 200 }
        )
    } catch (error) {
        console.log("Error while verifying code ", error)
        return Response.json({
            success: false,
            message: "Error while verifying code"
        },
            { status: 500 }
        )
    }
}