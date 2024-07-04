import {BotMatch, League, Match} from "@prisma/client";
import {prisma} from "~/database";
import {getHeader, getRouterParam, setResponseStatus} from "h3";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    // Get the name or id from the path
    const leagueIdOrName = getRouterParam(event, 'league_id');
    const matchId = getRouterParam(event, 'match_id');
    const isId = leagueIdOrName.startsWith('c');
    const userId = event.context.uniqueId;

    const league: League = await prisma.league.findFirst({
        where: {
            [isId ? 'id' : 'name']: leagueIdOrName
        }
    }) as any;

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'match_leaderboard',
        properties: {
            league_id: league.id,
            match_id: matchId
        }
    })

    if (!league) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'match_leaderboard_error',
            properties: {
                error: 'League not found',
                reason: `League with ${isId ? 'id' : 'name'} ${leagueIdOrName} not found`
            }
        })
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
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'match_leaderboard_error',
            properties: {
                error: 'Match not found',
                reason: `Match with id ${matchId} not found`
            }
        })
        setResponseStatus(event, 404);
        return {
            error: 'Match not found',
            message: `Match with id ${matchId} not found`
        };
    }

    let bots: BotMatch[] = await prisma.botMatch.findMany({
        where: {
            matchId: match.id
        }
    })

    delete match.leagueId;

    bots = bots.map(bot => {
        delete bot.matchId;
        return bot;
    });

    bots = bots.sort((a, b) => b.score - a.score);

    match.bots = bots;

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'match_leaderboard_success',
        properties: {
            league_id: league.id,
            match_id: matchId
        }
    });
    setResponseStatus(event, 200);
    return match;
});