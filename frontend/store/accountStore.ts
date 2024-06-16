import { defineStore } from "pinia";
import {hashPassword} from "~/composables/Accounts";
import * as jose from 'jose';
import type {PostHog} from "posthog-js";

export const useAccount = defineStore('account', {
    state: () => ({
        user: null as (User | null),
        token: null as (string | null),
        loggedIn: false
    }),
    actions: {
        async login(email: string, password: string): Promise<string | null> {
            const hashedPassword = await hashPassword(password)
            const nuxt = useNuxtApp();
            let uniqueId = 'anonymous'
            if (nuxt.$posthog()) {
                const posthog = nuxt.$posthog() as unknown as PostHog
                uniqueId = posthog.get_distinct_id()
            }
            // Call the backend API to login
            // Save the user and token in the store
            const res = await fetch('https://api.arena.n-king.com/auth/login', {
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
                const valid: boolean = await this.verifyToken();
                if (valid && nuxt.$posthog()) {
                    const posthog = nuxt.$posthog() as unknown as PostHog
                    posthog.identify(this.user?.id)
                }
                return valid ? null : 'Invalid token'
            }
        },
        logout() {
            this.user = null
            this.token = null
            this.loggedIn = false
            const nuxt = useNuxtApp();
            // If $posthog is void, then the plugin is not installed or not enabled
            if (nuxt.$posthog()) {
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
            const hashedPassword = await hashPassword(password)
            // Call the backend API to register
            // Save the user and token in the store
            return fetch('https://api.arena.n-king.com/auth/register', {
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
                    return this.verifyToken().then(valid => {
                        if (valid && nuxt.$posthog()) {
                            const posthog = nuxt.$posthog() as unknown as PostHog
                            posthog.identify(this.user?.id)
                        }
                        return valid ? null : 'Invalid token'
                    })
                }
            })
        },
        verifyToken(): Promise<boolean> {
            // Use jwt to verify the token and get the user
            // Save the user in the store
            return new Promise((resolve, reject) => {
                if (!this.token) {
                    resolve(false)
                } else {
                    const secret = new TextEncoder().encode(
                        process.env.JWT_SECRET as string
                    )

                    jose.jwtVerify(this.token as string, secret, {
                        issuer: 'arena',
                        audience: 'arena'
                    }).then((claims) => {
                        const decoded = jose.decodeJwt(this.token as string)
                        this.user = decoded.payload as User
                        this.loggedIn = true
                    }).catch((err) => {
                        this.logout()
                        resolve(false)
                    })
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
