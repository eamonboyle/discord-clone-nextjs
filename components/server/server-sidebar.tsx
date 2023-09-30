import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Channel_type, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import { ServerSearch } from "./server-search";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

type ServerSidebarProps = {
    serverId: string;
};

const iconMap = {
    [Channel_type.TEXT]: <Hash className="mr-2 h-4 w-4" />,
    [Channel_type.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
    [Channel_type.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: (
        <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
    ),
    [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
    const profile = await currentProfile();

    if (!profile) {
        return redirect("/");
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            members: {
                include: {
                    profile: true,
                },
                orderBy: {
                    role: "asc",
                },
            },
        },
    });

    if (!server) {
        return redirect("/");
    }

    const textChannels = server?.channels.filter(
        (channel) => channel.type === Channel_type.TEXT
    );

    const audioChannels = server?.channels.filter(
        (channel) => channel.type === Channel_type.AUDIO
    );

    const videoChannels = server?.channels.filter(
        (channel) => channel.type === Channel_type.VIDEO
    );

    const members = server?.members.filter(
        (member) => member.profileId !== profile.id
    );

    const role = server?.members.find(
        (member) => member.profileId === profile.id
    )?.role;

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerHeader server={server} role={role} />
            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <ServerSearch
                        data={[
                            {
                                label: "Text Channels",
                                type: "channel",
                                data: textChannels?.map((channel) => ({
                                    icon: iconMap[channel.type],
                                    name: channel.name,
                                    id: channel.id,
                                })),
                            },
                            {
                                label: "Voice Channels",
                                type: "channel",
                                data: audioChannels?.map((channel) => ({
                                    icon: iconMap[channel.type],
                                    name: channel.name,
                                    id: channel.id,
                                })),
                            },
                            {
                                label: "Video Channels",
                                type: "channel",
                                data: videoChannels?.map((channel) => ({
                                    icon: iconMap[channel.type],
                                    name: channel.name,
                                    id: channel.id,
                                })),
                            },
                            {
                                label: "Members",
                                type: "member",
                                data: members?.map((member) => ({
                                    icon: roleIconMap[member.role],
                                    name: member.profile.name,
                                    id: member.id,
                                })),
                            },
                        ]}
                    />
                </div>
            </ScrollArea>
        </div>
    );
};
