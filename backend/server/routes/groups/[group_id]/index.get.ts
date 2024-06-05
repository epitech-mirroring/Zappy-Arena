import {prisma} from "~/database";
import {getRouterParam, setResponseStatus} from "h3";
import {Bot, Group, League, User} from "@prisma/client";

export default eventHandler(async (event) => {
    const groupId = getRouterParam(event, 'group_id');
    if (!groupId) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid group id',
            message: 'Group id is required'
        };
    }

    const g: Group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    }) as Group;

    if (!g) {
        setResponseStatus(event, 404);
        return {
            error: 'Group not found',
            message: `Group with id ${groupId} not found`
        };
    }

    const group: Group & {members: User[], bots: (Bot & {league: League})[], bestLeague: League } = g as any;
    group.members = await prisma.user.findMany({
        where: {
            groupId: group.id
        }
    });

    group.bots = await prisma.bot.findMany({
        where: {
            groupId: group.id
        }
    }) as any;

    for (let i= 0; i < group.bots.length; i++) {
        group.bots[i].league = await prisma.league.findFirst({
            where: {
                id: group.bots[i].leagueId
            }
        });
    }

    group.bestLeague = group.bots.toSorted((a, b) => {
        return a.league.maxScore - b.league.maxScore;
    })[0].league;

    group.members = group.members.map(user => {
        delete user.groupId;
        delete user.password;
        delete user.email;
        delete user.createdAt;
        delete user.updatedAt;
        return user;
    });

    group.bots = group.bots.map(bot => {
        delete bot.groupId;
        delete bot.leagueId;
        delete bot.league.entryScore;
        delete bot.league.maxScore;
       return bot;
    });

    setResponseStatus(event,200);
    return group;
});