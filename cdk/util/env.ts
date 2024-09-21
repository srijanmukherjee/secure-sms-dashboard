export default function env(key: string): string {
    if (process.env[key] === undefined) {
        throw new Error(`environment variable ${key} not found`);
    }

    return process.env[key];
}