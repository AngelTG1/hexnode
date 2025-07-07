export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'Cliente' | 'memberships';
}

export interface AuthResponse {
    user: {
        id: number;
        uuid: string;
        name: string;
        lastName: string;
        email: string;
        phone?: string;
        role: string;
    };
    token: string;
}

export interface JwtPayload {
    userId: number;
    uuid: string;
    email: string;
    role: string;
}