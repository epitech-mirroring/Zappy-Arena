import {prisma} from "~/database";
import {setResponseStatus} from "h3";
import {League, Match} from "@prisma/client";

export default eventHandler(async (event) => {
    // Get the name or id from the path
    const idOrName = getRouterParam(event, 'league_id');
    const isId = idOrName.startsWith('c');

    const league: League & {matches: Match[]} = await prisma.league.findFirst({
        where: {
            [isId ? 'id' : 'name']: idOrName
        }
    }) as any;

    if (!league) {
        setResponseStatus(event, 404);
        return {
            error: 'League not found',
            message: `League with ${isId ? 'id' : 'name'} ${idOrName} not found`
        };
    }

    league.matches = await prisma.match.findMany({
        where: {
            leagueId: league.id
        }
    });

    league.matches = league.matches.map(match => {
        delete match.leagueId;
        return match;
    });

    setResponseStatus(event,200);
    return league;
});