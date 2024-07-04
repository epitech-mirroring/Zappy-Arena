import type {PostHog} from "posthog-js";

export type League = {
    id: string;
    name: string;
    entryScore: number;
    maxScore: number;
}

export const fetchLeagues = async (): Promise<League[]> => {
    const nuxt = useNuxtApp();
    let uniqueId = 'anonymous'
    if (nuxt.$posthog()) {
        const posthog = nuxt.$posthog() as unknown as PostHog
        uniqueId = posthog.get_distinct_id()
    }
    return fetch(nuxt.$config.public.apiHost + '/leagues', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': uniqueId
        }
    }).then(res => res.json())
}