import {BotMatch, League, Match} from "@prisma/client";
import {prisma} from "~/database";
import {getRouterParam, setResponseStatus} from "h3";

export default eventHandler(async (event) => {
    // Get the name or id from the path
    const leagueIdOrName = getRouterParam(event, 'league_id');
    const matchId = getRouterParam(event, 'match_id');
    const isId = leagueIdOrName.startsWith('c');

    const league: League = await prisma.league.findFirst({
        where: {
            [isId ? 'id' : 'name']: leagueIdOrName
        }
    }) as any;

    if (!league) {
        setResponseStatus(event, 404);
        return {
            error: 'League not found',
            message: `League with ${isId ? 'id' : 'name'} ${leagueIdOrName} not found`
        };
    }

    const match: Match & {bots: BotMatch[]} = await prisma.match.findFirst({
        where: {
            leagueId: league.id,
            id: matchId
        }
    }) as any;

    if (!match) {
        setResponseStatus(event, 404);
        return {
            error: 'Match not found',
            message: `Match with id ${matchId} not found`
        };
    }

    const bots = await prisma.botMatch.findMany({
        where: {
            matchId: match.id
        }
    })

    delete match.leagueId;

    match.bots = bots;

    match.bots = match.bots.map(bot => {
        delete bot.matchId;
        return bot;
    });

    setResponseStatus(event, 200);
    return match;
});