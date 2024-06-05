import {client} from "~/posthog";

export default defineNitroPlugin((nitro) => {
    nitro.hooks.hookOnce("close", async () => {
        await client.flush();
    });
})