export const hashPassword = (password: string): string => {
    const salt = "EpitechNantesSupremacy";
    const crypto = require('crypto');
    const sha256 = crypto.createHash('sha256');
    const sha384 = crypto.createHash('sha384');
    const hashed = sha256(password + salt);
    return sha384(hashed + salt).toString('hex');
}