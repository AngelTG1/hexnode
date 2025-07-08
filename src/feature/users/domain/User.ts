// ===== src/feature/auth/users/domain/User.ts =====
export class User {
    constructor(
        public readonly id: number,
        public readonly uuid: string,
        public readonly name: string,
        public readonly lastName: string,
        public readonly email: string,
        public readonly password: string,
        public readonly phone?: string,
        public readonly role: 'Cliente' | 'memberships' = 'Cliente',
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date
    ) {}

    // Método para obtener respuesta sin contraseña
    public toResponse(): UserResponse {
        return {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            role: this.role,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Método para verificar si el usuario es administrador
    public isAdmin(): boolean {
        return this.role === 'memberships';
    }

    // Método para verificar si es cliente
    public isCustomer(): boolean {
        return this.role === 'Cliente';
    }

    // Método para obtener el nombre completo
    public getFullName(): string {
        return `${this.name} ${this.lastName}`;
    }
}

export interface UserResponse {
    id: number;
    uuid: string;
    name: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'Cliente' | 'memberships';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateUserData {
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'Cliente' | 'memberships';
}

// Nuevo: Interface extendida para incluir información de suscripción
export interface UserWithSubscription extends UserResponse {
    subscription?: {
        isActive: boolean;
        planName?: string;
        expiresAt?: Date;
        canSell: boolean;
    };
}