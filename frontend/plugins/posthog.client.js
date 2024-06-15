import { defineNuxtPlugin } from '#app'
import posthog from 'posthog-js'
export default defineNuxtPlugin(nuxtApp => {
    const runtimeConfig = useRuntimeConfig();
    const posthogClient = posthog.init(runtimeConfig.public.posthogPublicKey, {
        api_host: runtimeConfig.public.posthogHost || "https://us.i.posthog.com",
        capture_pageview: false, // we add manual pageview capturing below
        capture_pageleave: false, // we add manual pageleave capturing below
        loaded: (posthog) => {
            if (import.meta.env.MODE === 'development') posthog.debug();
        }
    })

    // Make sure that pageviews are captured with each route change
    const router = useRouter();
    router.afterEach((to) => {
        nextTick(() => {
            posthog.capture('$pageview', {
                current_url: to.fullPath
            });
        }).then(r => {});
    });
    // Same for pageleave events
    router.beforeEach((to, from, next) => {
        next();
        posthog.capture('$pageleave', {
            current_url: from.fullPath
        });
    });


    return {
        provide: {
            posthog: () => posthogClient
        }
    }
})