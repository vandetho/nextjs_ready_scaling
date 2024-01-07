import NextAuth from 'next-auth';
import { authOptions } from '@/tembre/app/api/auth/[...nextauth]/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
