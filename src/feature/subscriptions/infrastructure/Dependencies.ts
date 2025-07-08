// ===== src/feature/subscriptions/infrastructure/dependencies.ts =====
import { GetSubscriptionPlansUseCase } from '../application/GetSubscriptionPlansUseCase';
import { CreateSubscriptionUseCase } from '../application/CreateSubscriptionUseCase';
import { GetMySubscriptionUseCase } from '../application/GetMySubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../application/CancelSubscriptionUseCase';

import { SubscriptionController } from './controller/SubscriptionController';
import { MysqlSubscriptionRepository } from './Repositories/MysqlSubscriptionRepository';

// ✅ NUEVO: Importar UserRepository
import { userRepository } from '../../users/infrastructure/Dependencies';

// Repositories (única instancia)
const subscriptionRepository = new MysqlSubscriptionRepository();

// Use Cases
const getSubscriptionPlansUseCase = new GetSubscriptionPlansUseCase(
    subscriptionRepository
);

const createSubscriptionUseCase = new CreateSubscriptionUseCase(
    subscriptionRepository,
    userRepository // ✅ NUEVO: Inyectar UserRepository
);

const getMySubscriptionUseCase = new GetMySubscriptionUseCase(
    subscriptionRepository
);

const cancelSubscriptionUseCase = new CancelSubscriptionUseCase(
    subscriptionRepository,
    userRepository // ✅ NUEVO: Inyectar UserRepository
);

// Controllers
const subscriptionController = new SubscriptionController(
    getSubscriptionPlansUseCase,
    createSubscriptionUseCase,
    getMySubscriptionUseCase,
    cancelSubscriptionUseCase
);

// Exports
export {
    // Controllers
    subscriptionController,
    
    // Use Cases
    getSubscriptionPlansUseCase,
    createSubscriptionUseCase,
    getMySubscriptionUseCase,
    cancelSubscriptionUseCase,
    
    // Repositories
    subscriptionRepository
};