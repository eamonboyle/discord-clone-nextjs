import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // delete channels
        await db.channel.deleteMany({
            where: {
                serverId: params.serverId,
            },
        });

        const server = await db.server.delete({
            where: {
                id: params.serverId,
                profileId: profile.id,
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProfile();
        const { name, imageUrl } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.serverId) {
            return new NextResponse("Server ID Missing", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id,
            },
            data: {
                name,
                imageUrl,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVERS_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
