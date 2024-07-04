import { defineNuxtPlugin } from '#app'
import * as jose from 'jose'

export default defineNuxtPlugin(async nuxtApp => {
    // Get the public key from the backend
    const publicKey: string = await fetch(nuxtApp.$config.public.apiHost + '/public-key',
        {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => data.publicKey)

    const ecPublicKey = await jose.importSPKI(publicKey, 'ES256');

    // Provide verification function to every component
    return {
        provide: {
            verifyToken: async (token: string): Promise<boolean> => {
                try {
                    const verifyResult = await jose.jwtVerify(token, ecPublicKey, {
                        algorithms: ['ES256'],
                        issuer: 'arena'
                    });

                    if (verifyResult.payload.exp && verifyResult.payload.exp < Date.now() / 1000) {
                        return false;
                    }

                    if (verifyResult.payload.iss !== 'arena') {
                        return false;
                    }

                    return true;
                } catch (e) {
                    return false;
                }
            },
            decodeToken: async (token: string): Promise<any> => {
                return jose.decodeJwt(token);
            },
            hashPassword: async (password: string): Promise<string> => {
                const salt = "EpitechNantesSupremacy";
                const encoder = new TextEncoder();
                let data = encoder.encode(password + salt);
                let hash = await crypto.subtle.digest('SHA-256', data);
                let hashBuffer = await crypto.subtle.digest('SHA-384', hash);
                let hashArray = Array.from(new Uint8Array(hashBuffer));
                let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                data = encoder.encode(hashHex + salt);
                hash = await crypto.subtle.digest('SHA-384', data);
                hashBuffer = await crypto.subtle.digest('SHA-384', hash);
                hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        }
    }
})