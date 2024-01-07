import axios from 'axios';
import { NextAuthOptions, User } from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';

async function refreshAccessToken(tokenObject: any) {
    try {
        // Get a new set of tokens with a refreshToken
        const { data } = await axios.post<{ user: User; accessToken: string; refreshToken: string }>(
            `${process.env.BACKEND_URL}/api/refresh-token`,
            {
                refreshToken: tokenObject.refreshToken,
            },
        );

        return {
            ...data,
            accessTokenExpiry: Date.now() + 60 * 60 * 1000,
        };
    } catch (error) {
        return {
            ...tokenObject,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        FacebookProvider({
            clientId: process.env.FACEBOOK_APP_ID || '',
            clientSecret: process.env.FACEBOOK_APP_SECRET || '',
        }),
    ],
    cookies: {},
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/',
    },
    callbacks: {
        async jwt({ token, profile, account }) {
            if (account && profile) {
                const names = (profile.name || '').split(' ');
                const { data } = await axios.post<{ user: User; accessToken: string; refreshToken: string }>(
                    `${process.env.BACKEND_URL}/api/sign-in`,
                    {
                        provider: account.provider,
                        providerId: account.providerAccountId,
                        firstName: names[0] || '',
                        lastName: names[1] || '',
                        email: profile.email,
                    },
                );
                token = {
                    ...token,
                    userId: data.user.id,
                    accessToken: data.accessToken,
                    accessTokenExpiry: 60 * 60 * 1000 + Date.now(),
                    refreshToken: data.refreshToken,
                };
            }

            const shouldRefreshTime = Math.round((token as any).accessTokenExpiry - Date.now());

            if (shouldRefreshTime <= 0) {
                return refreshAccessToken(token);
            }
            return Promise.resolve(token);
        },

        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            (session as any).accessTokenExpiry = token.accessTokenExpiry;
            (session as any).refreshToken = token.refreshToken;
            (session as any).error = token.error;
            (session.user as any).name = (token as any).name;
            (session.user as any).email = (token as any).email;
            (session.user as any).id = (token as any).userId;

            return session;
        },
    },
    theme: {
        colorScheme: 'auto', // "auto" | "dark" | "light"
        logo: '/icon-512.png', // Absolute URL to image
    },
    debug: process.env.NODE_ENV === 'development',
};
