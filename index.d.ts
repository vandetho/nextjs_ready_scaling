import { User } from '@/tembre/types';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            APP_SECRET: string;
            NEXTAUTH_SECRET: string;
            BACKEND_URL: string;
            BACKEND_IMAGE_URL: string;
            NEXT_PUBLIC_APP_ENV: 'development' | 'production';
        }
    }
}

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        expires: string;
        accessToken: string;
        accessTokenExpiry: string;
        refreshToken: string;
        error: string;
        user: User;
    }

    interface JWT {
        accessToken: string;
        refreshToken: string;
    }
}

declare module 'y-websocket';

export {};
