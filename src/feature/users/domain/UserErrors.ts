// ===== src/users/domain/UserErrors.ts =====
export class UserError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'UserError';
    }
}

export class EmailAlreadyExistsError extends UserError {
    constructor(email: string) {
        super(`Email ${email} already exists`, 'EMAIL_ALREADY_EXISTS');
    }
}

export class UserNotFoundError extends UserError {
    constructor(identifier: string) {
        super(`User with identifier ${identifier} not found`, 'USER_NOT_FOUND');
    }
}

export class InvalidEmailFormatError extends UserError {
    constructor(email: string) {
        super(`Invalid email format: ${email}`, 'INVALID_EMAIL_FORMAT');
    }
}

export class RequiredFieldError extends UserError {
    constructor(field: string) {
        super(`Required field missing: ${field}`, 'REQUIRED_FIELD_MISSING');
    }
}