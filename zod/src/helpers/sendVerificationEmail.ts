import { resend } from "@/lib/resend"
import VerificationEmail from "@/emails/VerficationEmail"
import { ApiResponse } from "@/types/ApiResponse"

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'workingforrahul@gmail.com',
            to: email,
            subject: 'User Verification',
            react: VerificationEmail({ username, otp: verifyCode }),
        });
        return {
            success: true,
            message: "Verification send successfully"
        }
    } catch (emailError) {
        console.error("Error sending verification email", emailError)
        return {
            success: false,
            message: "Email sending failed"
        }
    }
}