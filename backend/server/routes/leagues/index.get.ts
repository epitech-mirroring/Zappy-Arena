import {prisma} from "~/database";
import {setResponseStatus} from "h3";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    const leagues = await prisma.league.findMany();

    client.capture({
        distinctId: 'anonymous',
        event: 'league_list'
    })

    setResponseStatus(event,200);
    return leagues;
});