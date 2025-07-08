// ===== src/feature/auth/domain/Auth.ts =====

export interface LoginRequest {
    email: string;
    password: string;
    // ✅ NUEVO: Datos del dispositivo para FCM
    fcmToken?: string;
    deviceType?: 'android' | 'ios' | 'web';
    deviceId?: string;
    deviceName?: string;
}

export interface RegisterRequest {
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'Cliente' | 'memberships';
    // ✅ NUEVO: Datos del dispositivo para FCM
    fcmToken?: string;
    deviceType?: 'android' | 'ios' | 'web';
    deviceId?: string;
    deviceName?: string;
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
    // ✅ NUEVO: Confirmación de registro FCM
    fcmRegistered?: boolean;
    deviceRegistered?: boolean;
}

export interface JwtPayload {
    userId: number;
    uuid: string;
    email: string;
    role: string;
}

// ✅ NUEVO: Interfaces para FCM
export interface FCMTokenData {
    userId: number;
    fcmToken: string;
    deviceType: 'android' | 'ios' | 'web';
    deviceId?: string;
    deviceName?: string;
}

export interface FCMNotificationData {
    userId: number;
    title: string;
    body: string;
    data?: Record<string, any>;
    notificationType: string;
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, any>;
    token: string;
}