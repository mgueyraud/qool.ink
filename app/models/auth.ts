import { prisma } from "~/db.server";
import { compare, hash } from 'bcryptjs';
import { createCookieSessionStorage, redirect } from "@remix-run/node";

export type Credentials = { email: string, password: string };
const SESSION_SECRET = process.env.SESSION_SECRET as string;

const sessionStorage = createCookieSessionStorage({
    cookie:{
        secure: process.env.NODE_ENV === 'production',
        secrets:[SESSION_SECRET],
        sameSite: 'lax',
        maxAge: 30*60*60*24,
        httpOnly: true
    }
})

export async function createUserSession(id: string, redirectPath: string){
    const session = await sessionStorage.getSession();
    session.set('user_id', id);
    return redirect(redirectPath, {
        headers:{
            'Set-Cookie':await sessionStorage.commitSession(session)
        }
    })
}

export async function getUserSession(request: Request){
    const session = await sessionStorage.getSession(request.headers.get('Cookie'));
    const userId = session.get('user_id') as string;

    if(!userId) return null;

    return userId;
}

export async function requireUserSession(request: Request){
    const userId = await getUserSession(request);

    if (!userId && !request.url.includes('login') && !request.url.includes('signup')) throw redirect('/login');

    return userId;
}

export async function destroyUserSession(request: Request, redirectPath: string){
    const session = await sessionStorage.getSession(request.headers.get('Cookie'));

    return redirect(redirectPath, {
        headers:{
            'Set-Cookie':await sessionStorage.destroySession(session)
        }
    })
}

interface CreateUser extends Credentials{
    name: string
}

export async function createUser({email, password, name}:CreateUser){
    const existingUser = await prisma.user.findFirst({ where:{ email } });

    if(existingUser) {
        throw new Error("Email is already taken")
    }
    
    const hashedPassword = await hash(password, 12);

    return prisma.user.create({data:{
        name,
        email,
        password:{
            create:{
                hash: hashedPassword
            }
        }
    }});
}

export async function getUser(userId: string){
    const user = await prisma.user.findFirst({where: { id: userId }});
    return user;
}

export async function verifyLogin({ email, password }: Credentials){
    const user = await prisma.user.findFirst({ where:{ email }, include: { password: true }});

    if (!user || !user.password) {
        return null;
    }

    const hasSamePassword = await compare(password, user.password.hash);

    if(!hasSamePassword){
        return null;
    }

    return user;
}
