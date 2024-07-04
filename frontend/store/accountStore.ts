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
                return this.loginWithToken(res.token)
            }
        },
        async loginWithToken(_token: string): Promise<string | null> {
            this.token = _token
            const nuxt = useNuxtApp();
            const valid: boolean = await nuxt.$verifyToken(this.token)
            if (this.loggedIn && nuxt.$posthog()) {
                const posthog = nuxt.$posthog() as unknown as PostHog
                posthog.reset()
            }
            if (valid && nuxt.$posthog()) {
                const posthog = nuxt.$posthog() as unknown as PostHog
                this.user = await nuxt.$decodeToken(this.token) as User & JWTPayload
                this.loggedIn = true
                posthog.identify(this.user?.id, {
                    email: this.user?.email,
                    name: this.user?.name
                })

                // Create or update local storage for persisting login
                const storage = window.localStorage
                storage.setItem('token', this.token!)
            } else {
                this.token = null
                this.loggedIn = false
                this.user = null
                if (nuxt.$posthog()) {
                    const posthog = nuxt.$posthog() as unknown as PostHog
                    posthog.reset()
                }
            }
            return valid ? null : 'Invalid token'
        },
        checkAuth(): Promise<string | null> {
            const nuxt = useNuxtApp();
            const token = window.localStorage.getItem('token')
            if (token) {
                return this.loginWithToken(token)
            } else {
                return Promise.resolve('No token found')
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
                    return this.loginWithToken(res.token)
                }
            })
        },
        getSLT(): Promise<string> {
            const nuxt = useNuxtApp();
            let uniqueId = 'anonymous'
            if (nuxt.$posthog()) {
                const posthog = nuxt.$posthog() as unknown as PostHog
                uniqueId = posthog.get_distinct_id()
            }
            return fetch(nuxt.$config.public.apiHost + '/auth/slt', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': uniqueId,
                    'Authorization': 'Bearer ' + this.token
                }
            }).then(res => res.json()).then(res => {
                return res.token
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
