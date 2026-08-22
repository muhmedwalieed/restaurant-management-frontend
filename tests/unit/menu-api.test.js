import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getCategoriesApi,
  getCategoryByIdApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getProductsApi,
  getProductByIdApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getModifiersApi,
  createModifierApi,
  updateModifierApi,
  deleteModifierApi,
  getPublicMenuApi,
} from '../../src/lib/api/menu.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Module 4 Menu API Services Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== CATEGORIES TESTS ====================
  it('getCategoriesApi should call GET /categories with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [{ id: 'cat-1', name: 'وجبات رئيسية' }] });
    const res = await getCategoriesApi({ page: 1, limit: 10, status: 'ACTIVE' });
    expect(apiClient.get).toHaveBeenCalledWith('/menu/categories', { params: { page: 1, limit: 10, status: 'ACTIVE' } });
    expect(res.items.length).toBe(1);
  });

  it('getCategoryByIdApi should call GET /categories/:id', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'cat-1', name: 'برجر' });
    const res = await getCategoryByIdApi('cat-1');
    expect(apiClient.get).toHaveBeenCalledWith('/menu/categories/cat-1');
    expect(res.name).toBe('برجر');
  });

  it('createCategoryApi should call POST /categories', async () => {
    const payload = { name: 'مقبلات', description: 'شهية', sortOrder: 1, status: 'ACTIVE' };
    apiClient.post.mockResolvedValueOnce({ id: 'cat-2', ...payload });
    const res = await createCategoryApi(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/menu/categories', payload);
    expect(res.id).toBe('cat-2');
  });

  it('updateCategoryApi should call PATCH /categories/:id', async () => {
    const payload = { name: 'مقبلات باردة' };
    apiClient.patch.mockResolvedValueOnce({ id: 'cat-2', name: 'مقبلات باردة' });
    const res = await updateCategoryApi('cat-2', payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/menu/categories/cat-2', payload);
    expect(res.name).toBe('مقبلات باردة');
  });

  it('deleteCategoryApi should call DELETE /categories/:id', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'Category deleted' });
    const res = await deleteCategoryApi('cat-2');
    expect(apiClient.delete).toHaveBeenCalledWith('/menu/categories/cat-2');
    expect(res.message).toBe('Category deleted');
  });

  // ==================== PRODUCTS TESTS ====================
  it('getProductsApi should call GET /products with query filters', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [{ id: 'prod-1', name: 'تشيز برجر' }] });
    const params = { categoryId: 'cat-1', isAvailable: true, search: 'برجر', page: 1, limit: 20 };
    const res = await getProductsApi(params);
    expect(apiClient.get).toHaveBeenCalledWith('/menu/products', { params });
    expect(res.items.length).toBe(1);
  });

  it('createProductApi should call POST /products with description & imageUrl', async () => {
    const payload = {
      categoryId: 'cat-1',
      name: 'تشيز برجر سينجل',
      description: 'قطعة لحم بلدي مع جبنة شيدر',
      price: 150,
      imageUrl: 'https://example.com/burger.jpg',
      isAvailable: true,
      status: 'ACTIVE',
    };
    apiClient.post.mockResolvedValueOnce({ id: 'prod-1', ...payload });
    const res = await createProductApi(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/menu/products', payload);
    expect(res.id).toBe('prod-1');
  });

  it('updateProductApi should call PATCH /products/:id', async () => {
    const payload = { isAvailable: false };
    apiClient.patch.mockResolvedValueOnce({ id: 'prod-1', isAvailable: false });
    const res = await updateProductApi('prod-1', payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/menu/products/prod-1', payload);
    expect(res.isAvailable).toBe(false);
  });

  it('deleteProductApi should call DELETE /products/:id', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'Product deleted' });
    const res = await deleteProductApi('prod-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/menu/products/prod-1');
    expect(res.message).toBe('Product deleted');
  });

  // ==================== MODIFIERS TESTS ====================
  it('getModifiersApi should call GET /products/:productId/modifiers', async () => {
    apiClient.get.mockResolvedValueOnce([{ id: 'mod-1', name: 'جبنة إضافية', priceDelta: 20 }]);
    const res = await getModifiersApi('prod-1');
    expect(apiClient.get).toHaveBeenCalledWith('/menu/products/prod-1/modifiers');
    expect(res.length).toBe(1);
  });

  it('createModifierApi should call POST /products/:productId/modifiers', async () => {
    const payload = { name: 'صوص هالبينو', priceDelta: 15, isRequired: false };
    apiClient.post.mockResolvedValueOnce({ id: 'mod-2', ...payload });
    const res = await createModifierApi('prod-1', payload);
    expect(apiClient.post).toHaveBeenCalledWith('/menu/products/prod-1/modifiers', payload);
    expect(res.id).toBe('mod-2');
  });

  it('updateModifierApi should call PATCH /products/:productId/modifiers/:modifierId', async () => {
    const payload = { priceDelta: 25 };
    apiClient.patch.mockResolvedValueOnce({ id: 'mod-1', priceDelta: 25 });
    const res = await updateModifierApi('prod-1', 'mod-1', payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/menu/products/prod-1/modifiers/mod-1', payload);
    expect(res.priceDelta).toBe(25);
  });

  it('deleteModifierApi should call DELETE /products/:productId/modifiers/:modifierId', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'Modifier deleted' });
    const res = await deleteModifierApi('prod-1', 'mod-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/menu/products/prod-1/modifiers/mod-1');
    expect(res.message).toBe('Modifier deleted');
  });

  // ==================== PUBLIC MENU TESTS ====================
  it('getPublicMenuApi should call GET /menu/public with slug query param', async () => {
    apiClient.get.mockResolvedValueOnce({ restaurant: { slug: 'burger-house' }, categories: [] });
    const res = await getPublicMenuApi({ slug: 'burger-house' });
    expect(apiClient.get).toHaveBeenCalledWith('/menu/public', { params: { slug: 'burger-house' } });
    expect(res.restaurant.slug).toBe('burger-house');
  });
});
