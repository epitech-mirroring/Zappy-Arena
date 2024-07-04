import {prisma} from "~/database";
import {getHeader, setResponseStatus} from "h3";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    const leagues = await prisma.league.findMany();
    // Check if the user gave us a unique identifier
    const userId = event.context.uniqueId;

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'league_list'
    })

    setResponseStatus(event,200);
    return leagues;
});