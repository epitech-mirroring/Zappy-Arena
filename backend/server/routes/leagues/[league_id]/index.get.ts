import {prisma} from "~/database";
import {getHeader, setResponseStatus} from "h3";
import {League, Match} from "@prisma/client";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    // Get the name or id from the path
    const idOrName = getRouterParam(event, 'league_id');
    const isId = idOrName.startsWith('c');
    const userId = getHeader(event, 'X-User-Id');

    const league: League & {matches: Match[]} = await prisma.league.findFirst({
        where: {
            [isId ? 'id' : 'name']: idOrName
        }
    }) as any;

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'league_info',
        properties: {
            league_id: league.id
        }
    })

    if (!league) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'league_info_error',
            properties: {
                error: 'League not found',
                reason: `League with ${isId ? 'id' : 'name'} ${idOrName} not found`
            }
        })
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

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'league_info_success',
        properties: {
            league_id: league.id
        }
    })
    setResponseStatus(event,200);
    return league;
});