import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
  companyName: string;
  role: string;
  emailVerified: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Rate limit: 10 attempts per email per 15 minutes
        const rl = rateLimit(`login:${credentials.email}`, { limit: 10, windowSeconds: 900 });
        if (!rl.success) {
          throw new Error("Demasiados intentos. Intenta nuevamente en unos minutos.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true },
        });

        if (!user) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.companyId || "",
          companyName: user.company?.name || "",
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as AuthUser;
        token.companyId = typedUser.companyId;
        token.companyName = typedUser.companyName;
        token.role = typedUser.role;
        token.emailVerified = typedUser.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as AuthUser).id = token.sub as string;
        (session.user as AuthUser).companyId = token.companyId as string;
        (session.user as AuthUser).companyName = token.companyName as string;
        (session.user as AuthUser).role = token.role as string;
        (session.user as AuthUser).emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getSessionOrThrow() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    throw new Error("No autorizado");
  }
  return session;
}
