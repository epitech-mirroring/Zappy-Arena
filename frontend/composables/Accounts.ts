export const hashPassword = async (password: string): Promise<string> => {
    const salt = "EpitechNantesSupremacy";
    const encoder = new TextEncoder();
    let data = encoder.encode(password + salt);
    const hash = crypto.subtle.digest('SHA-256', data);
    data = encoder.encode(hash + salt);
    return (await crypto.subtle.digest('SHA-384', data)).toString();
}