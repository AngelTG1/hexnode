// ===== src/feature/products/infrastructure/Dependencies.ts =====
// Use Cases
import { CreateProductUseCase } from '../application/CreateProductUseCase';
import { GetAllProductsUseCase } from '../application/GetAllProductsUseCase';
import { GetProductByUuidUseCase } from '../application/GetProductByUuidUseCase';
import { GetMyProductsUseCase } from '../application/GetMyProductsUseCase';
import { UpdateProductUseCase } from '../application/UpdateProductUseCase';
import { DeleteProductUseCase } from '../application/DeleteProductUseCase';
import { SearchProductsUseCase } from '../application/SearchProductsUseCase';

// Controllers
import { ProductController } from './controller/ProductController';

// Repositories
import { MysqlProductRepository } from './Repositories/MysqlProductRepository';

// Repository - Instancia única
const productRepository = new MysqlProductRepository();

// Use Cases - Casos de uso con sus dependencias
const createProductUseCase = new CreateProductUseCase(productRepository);
const getAllProductsUseCase = new GetAllProductsUseCase(productRepository);
const getProductByUuidUseCase = new GetProductByUuidUseCase(productRepository);
const getMyProductsUseCase = new GetMyProductsUseCase(productRepository);
const updateProductUseCase = new UpdateProductUseCase(productRepository);
const deleteProductUseCase = new DeleteProductUseCase(productRepository);
const searchProductsUseCase = new SearchProductsUseCase(productRepository);

// Controllers - Controlador principal con todos los casos de uso
const productController = new ProductController(
    createProductUseCase,
    getAllProductsUseCase,
    getProductByUuidUseCase,
    getMyProductsUseCase,
    updateProductUseCase,
    deleteProductUseCase,
    searchProductsUseCase
);

// Exports - Exportar todas las instancias configuradas
export {
    // Controller
    productController,
    
    // Use Cases (por si necesitas usarlos individualmente)
    createProductUseCase,
    getAllProductsUseCase,
    getProductByUuidUseCase,
    getMyProductsUseCase,
    updateProductUseCase,
    deleteProductUseCase,
    searchProductsUseCase,
    
    // Repository (por si otros módulos lo necesitan)
    productRepository
};