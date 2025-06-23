import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  // Remover adapter cuando usas JWT strategy
  // adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: null,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await compare(credentials.password, user.hashedPassword);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null, 
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  // Permitir que un usuario tenga múltiples proveedores
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account, profile }) {
      // Permitir vincular cuentas OAuth a usuarios existentes
      if (account?.provider === "google" && user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (existingUser) {
          // Si el usuario existe, permitir el login y actualizar
          if (profile?.picture) {
            await prisma.user.update({
              where: { email: user.email },
              data: { 
                lastLoginAt: new Date(),
                imageUrl: profile.picture
              }
            });
          }
          return true;
        }
      }
      if (user?.email) {
        if (account?.provider === "google" && profile?.picture) {
          // Siempre actualizar con la imagen más reciente de Google
          await prisma.user.upsert({
            where: { email: user.email },
            update: { 
              lastLoginAt: new Date(),
              imageUrl: profile.picture // Siempre actualizar la imagen de Google
            },
            create: {
              email: user.email,
              name: user.name,
              imageUrl: profile.picture,
              lastLoginAt: new Date(),
            }
          });
        } else {
          await prisma.user.updateMany({
            where: { email: user.email },
            data: { lastLoginAt: new Date() },
          });
        }
      }
      return true;
    },

    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        // Prioridad: imagen personalizada de Cloudinary > imagen de Google > null
        if (dbUser?.imageId) {
          // Construir URL de Cloudinary usando el imageId
          const cloudinaryBaseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME 
            ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`
            : '';
          
          if (cloudinaryBaseUrl) {
            token.picture = `${cloudinaryBaseUrl}c_fill,w_150,h_150,f_auto,q_auto/${dbUser.imageId}`;
          } else {
            console.warn("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not configured");
            token.picture = dbUser.imageUrl || null;
          }
        } else if (dbUser?.imageUrl) {
          // Usar imagen de Google si no hay imagen personalizada
          token.picture = dbUser.imageUrl;
        } else {
          token.picture = null;
        }

        token.id = dbUser?.id ?? token.id;
        token.name = dbUser?.name ?? token.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
};