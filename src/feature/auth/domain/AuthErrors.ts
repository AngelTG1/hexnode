export class AuthError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export class InvalidCredentialsError extends AuthError {
    constructor() {
        super('Invalid email or password', 'INVALID_CREDENTIALS');
    }
}

export class TokenExpiredError extends AuthError {
    constructor() {
        super('Token has expired', 'TOKEN_EXPIRED');
    }
}

export class InvalidTokenError extends AuthError {
    constructor() {
        super('Invalid token', 'INVALID_TOKEN');
    }
}

export class WeakPasswordError extends AuthError {
    constructor() {
        super('Password must be at least 8 characters long', 'WEAK_PASSWORD');
    }
}