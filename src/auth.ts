
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/prisma"

function getRandomNumber() {
    return Math.floor(Math.random() * 5) + 1;
}

export const findUserByPlatformID = async (platform_id: string) => {
    const user = await prisma.user.findFirst({
        where: {
            github_id: platform_id,
        },
    });
    return user;
};

export const createUserInDatabase = async (
    email: string,
    platform_id: string,
    name?: string | null,
    image?: string | null,
) => {
    const newUser = await prisma.user.create({
        data: {
            email,
            name,
            image,
            create_time: new Date(),
            update_time: new Date(),
            github_id: platform_id,
            profile: `/assets/profiles/0${getRandomNumber()}.png`
        },
    });
    return newUser;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [GitHub, GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            const user_mail = user.email;
            const platform_id = profile?.id?.toString() || profile?.sub?.toString();
            if (!user_mail || !platform_id) return false;

            const dbUser = await findUserByPlatformID(platform_id);
            if (!dbUser) {
                // 如果用户不存在，创建新用户
                await createUserInDatabase(user_mail, platform_id, user.name, user.image);
            }
            return true; // 登録を許せる
        },
        async jwt({ token, account, profile }) {
            const platform_id = profile?.id?.toString() || profile?.sub?.toString();

            //　user_idをtokenに追加する
            if (platform_id) {

                const dbUser = await findUserByPlatformID(platform_id);

                token.user_id = dbUser?.user_id;
                token.profile = dbUser?.profile;
            }

            return token;
        },

        async session({ session, token }) {
            const userId = token.user_id;
            const profile = token.profile;
            if (typeof userId === "string" && typeof profile === "string") {
                session.userId = userId;
                session.profile = profile;
            }
            // user_idをトークンからセッションに追加する
            return session;
        },
    }
})