// ===== src/feature/cart/infrastructure/Dependencies.ts =====

// Use Cases
import { AddToCartUseCase } from '../application/AddToCartUseCase';
import { GetCartUseCase } from '../application/GetCartUseCase';
import { UpdateCartItemUseCase } from '../application/UpdateCartItemUseCase';
import { RemoveFromCartUseCase } from '../application/RemoveFromCartUseCase';
import { ClearCartUseCase } from '../application/ClearCartUseCase';
import { GetCartSummaryUseCase } from '../application/GetCartSummaryUseCase';

// Controllers
import { CartController } from './controllers/CartController';

// Repositories
import { MysqlCartRepository } from './repositories/MysqlCartRepository';

// Import product repository (ya existente)
import { productRepository } from '../../products/infrastructure/Dependencies';

// ===== REPOSITORIOS =====

// Repository del carrito - Instancia única
const cartRepository = new MysqlCartRepository();

// ===== USE CASES =====

// Use Cases del carrito con sus dependencias
const addToCartUseCase = new AddToCartUseCase(cartRepository, productRepository);
const getCartUseCase = new GetCartUseCase(cartRepository);
const updateCartItemUseCase = new UpdateCartItemUseCase(cartRepository, productRepository);
const removeFromCartUseCase = new RemoveFromCartUseCase(cartRepository);
const clearCartUseCase = new ClearCartUseCase(cartRepository);
const getCartSummaryUseCase = new GetCartSummaryUseCase(cartRepository);

// ===== CONTROLLERS =====

// Controlador principal del carrito con todos los casos de uso
const cartController = new CartController(
    addToCartUseCase,
    getCartUseCase,
    updateCartItemUseCase,
    removeFromCartUseCase,
    clearCartUseCase,
    getCartSummaryUseCase
);

// ===== EXPORTS =====

// Exportar todas las instancias configuradas
export {
    // Controller principal
    cartController,
    
    // Use Cases (por si necesitas usarlos individualmente)
    addToCartUseCase,
    getCartUseCase,
    updateCartItemUseCase,
    removeFromCartUseCase,
    clearCartUseCase,
    getCartSummaryUseCase,
    
    // Repository (por si otros módulos lo necesitan)
    cartRepository
};