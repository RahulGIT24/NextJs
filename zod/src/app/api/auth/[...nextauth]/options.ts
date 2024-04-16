import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "domain-login",
            name: "Domain Account",
            credentials: {
                username: { label: "Username", type: "text" },
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { username: credentials.identifier },
                            { email: credentials.identifier }
                        ]
                    })
                    if (!user) {
                        throw new Error("No user found")
                    }
                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login")
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user;
                    }
                    else {
                        throw new Error("Invalid Credentials")
                    }
                } catch (e: any) {
                    throw new Error(e);
                }
            },
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified,
                token.isAcceptingMessages = user.isAcceptingMessages,
                token.username = user.username

            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id?.toString()
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session;
        }
    },
    pages: {
        signIn: '/signin'
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXT_AUTH_SECRET

}