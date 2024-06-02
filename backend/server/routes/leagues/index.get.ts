import {prisma} from "~/database";
import {setResponseStatus} from "h3";

export default eventHandler(async (event) => {
    const leagues = await prisma.league.findMany();

    setResponseStatus(event,200);
    return leagues;
});