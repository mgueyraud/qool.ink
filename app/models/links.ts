import type { Link } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createLink(link: Pick<Link, 'slug' | 'publish' | 'title' | 'url' | 'userId'>){
    const existingSlug = await prisma.link.findFirst({ where:{ slug: link.slug } });
    
    if(existingSlug){
        throw new Error("Slug is already taken");
    }
    
    return prisma.link.create({
        data: {
            slug: link.slug,
            publish: link.publish,
            title: link.title,
            url: link.url,
            User: {
                connect:{
                    id: link.userId
                }
            }
        }
    })
}

export async function getLinkBySlug(slug: string){
    return prisma.link.findFirst({
        where:{
            slug
        },
        select: {
            url: true
        }
    })
}

export async function getLinks(userId: string){
    return prisma.link.findMany({
        where:{
            userId
        },
        select:{
            id: true,
            title: true,
            slug: true,
            publish: true
        },
        orderBy:{
            createdAt: 'desc'
        }
    })
}