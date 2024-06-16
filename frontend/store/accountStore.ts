import {defineStore} from "pinia";
import type {PostHog} from "posthog-js";
import type {JWTPayload} from "jose";

export const useAccount = defineStore('account', {
    state: () => ({
        user: null as (User | null),
        token: null as (string | null),
        loggedIn: false
    }),
    actions: {
        async login(email: string, password: string): Promise<string | null> {
            const nuxt = useNuxtApp();
            const hashedPassword = await nuxt.$hashPassword(password)
            let uniqueId = 'anonymous'
            if (nuxt.$posthog()) {
                const posthog = nuxt.$posthog() as unknown as PostHog
                uniqueId = posthog.get_distinct_id()
            }
            // Call the backend API to login
            // Save the user and token in the store
            const res = await fetch(nuxt.$config.public.apiHost + '/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': uniqueId
                },
                body: JSON.stringify({email, password: hashedPassword})
            }).then(res => res.json())

            if (res.error) {
                return res.message;
            } else {
                this.token = res.token
                const valid: boolean = await nuxt.$verifyToken(res.token)
                if (this.loggedIn && nuxt.$posthog()) {
                    const posthog = nuxt.$posthog() as unknown as PostHog
                    posthog.reset()
                }
                if (valid && nuxt.$posthog()) {
                    const posthog = nuxt.$posthog() as unknown as PostHog
                    this.user = await nuxt.$decodeToken(res.token) as User & JWTPayload
                    this.loggedIn = true
                    posthog.identify(this.user?.id, {email: this.user?.email, name: this.user?.name})
                } else {
                    this.token = null
                    this.loggedIn = false
                    this.user = null
                }
                return valid ? null : 'Invalid token'
            }
        },
        logout() {
            const wasLoggedIn = this.loggedIn
            this.user = null
            this.token = null
            this.loggedIn = false
            const nuxt = useNuxtApp();
            // If $posthog is void, then the plugin is not installed or not enabled
            if (nuxt.$posthog() && wasLoggedIn) {
                const posthog = nuxt.$posthog() as unknown as PostHog
                posthog.reset()
            }
        },
        async register(email: string, password: string, name: string): Promise<string | null> {
            const nuxt = useNuxtApp();
            let uniqueId = 'anonymous'
            if (nuxt.$posthog()) {
                const posthog = nuxt.$posthog() as unknown as PostHog
                uniqueId = posthog.get_distinct_id()
            }
            const hashedPassword = await nuxt.$hashPassword(password)
            // Call the backend API to register
            // Save the user and token in the store
            return fetch(nuxt.$config.public.apiHost + '/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': uniqueId
                },
                body: JSON.stringify({email, password: hashedPassword, name})
            }).then(res => res.json()).then(res => {
                if (res.error) {
                    return res.message
                } else {
                    this.token = res.token
                    if (this.token) {
                        return nuxt.$verifyToken(this.token).then(async valid => {
                            if (this.loggedIn && nuxt.$posthog()) {
                                const posthog = nuxt.$posthog() as unknown as PostHog
                                posthog.reset()
                            }
                            if (valid && nuxt.$posthog()) {
                                const posthog = nuxt.$posthog() as unknown as PostHog
                                posthog.identify(this.user?.id)
                                this.user = await nuxt.$decodeToken(res.token) as User & JWTPayload
                                this.loggedIn = true
                            } else {
                                this.token = null
                                this.loggedIn = false
                                this.user = null
                            }
                            return valid ? null : 'Invalid token'
                        })
                    } else {
                        return 'Invalid token'
                    }
                }
            })
        }
    },
    getters: {
        getUser(): User | null {
            return this.user
        },
        getToken(): string | null {
            return this.token
        },
        isLoggedIn(): boolean {
            return this.loggedIn
        }
    }
})

export interface User {
    id: string;
    name: string;
    email: string;
    groupId?: string;
}
