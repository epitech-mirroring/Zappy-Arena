export const hashPassword = async (password: string): Promise<string> => {
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