export const hashPassword = (password: string): string => {
    const salt = "EpitechNantesSupremacy";
    const encoder = new TextEncoder();
    let data = encoder.encode(password + salt);
    const hash = crypto.subtle.digest('SHA-256', data);
    data = encoder.encode(hash + salt);
    return crypto.subtle.digest('SHA-384', data).toString();
}