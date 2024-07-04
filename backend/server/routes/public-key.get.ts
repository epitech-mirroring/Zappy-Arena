import {getHeader, setResponseStatus} from "h3";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    const userId = event.context.uniqueId;

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'public_key_fetch'
    })

    setResponseStatus(event,200);
    return { publicKey: process.env.JWT_PUBLIC_KEY };
});