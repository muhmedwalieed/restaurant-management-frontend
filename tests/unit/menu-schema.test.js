import { describe, it, expect } from 'vitest';
import {
  categoryFormSchema,
  productFormSchema,
  modifierFormSchema,
} from '../../src/modules/menu/schemas/menu.schema.js';

describe('Module 4 Menu Validation Schemas Unit Tests', () => {
  describe('Category Form Schema', () => {
    it('should pass with valid category data', () => {
      const input = {
        name: 'برجر',
        description: 'أفضل أنواع البرجر',
        sortOrder: 1,
        status: 'ACTIVE',
      };
      const result = categoryFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail when name is less than 2 chars', () => {
      const input = { name: 'أ' };
      const result = categoryFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('اسم التصنيف يجب أن يكون حرفين على الأقل');
    });

    it('should fail when sortOrder is negative', () => {
      const input = { name: 'برجر', sortOrder: -1 };
      const result = categoryFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('Product Form Schema', () => {
    it('should pass with valid product data including description and imageUrl', () => {
      const input = {
        categoryId: 'cat-123',
        name: 'تشيز برجر سينجل',
        description: 'لحم بلدي فاخر',
        price: '150.50',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        isAvailable: true,
        status: 'ACTIVE',
      };
      const result = productFormSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(150.5);
      }
    });

    it('should pass with empty imageUrl or optional description', () => {
      const input = {
        categoryId: 'cat-123',
        name: 'كولا',
        price: 30,
      };
      const result = productFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail when categoryId is missing', () => {
      const input = {
        categoryId: '',
        name: 'تشيز برجر',
        price: 100,
      };
      const result = productFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('يرجى اختيار التصنيف الخاص بالمنتج');
    });

    it('should fail when price is non-positive or 0', () => {
      const input = {
        categoryId: 'cat-1',
        name: 'مجاني',
        price: 0,
      };
      const result = productFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('سعر المنتج يجب أن يكون أكبر من 0');
    });

    it('should fail when imageUrl is invalid URL string', () => {
      const input = {
        categoryId: 'cat-1',
        name: 'منتج',
        price: 50,
        imageUrl: 'invalid-url-format',
      };
      const result = productFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('أرفع صورة من جهازك أو أدخل رابط صورة صحيح');
    });
  });

  describe('Modifier Form Schema', () => {
    it('should pass with valid modifier data', () => {
      const input = {
        name: 'جبنة شيدر إضافية',
        priceDelta: '25',
        isRequired: false,
      };
      const result = modifierFormSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priceDelta).toBe(25);
      }
    });

    it('should fail when priceDelta is negative', () => {
      const input = {
        name: 'خصم',
        priceDelta: -5,
      };
      const result = modifierFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('سعر الإضافة لا يمكن أن يكون بالسالب');
    });
  });
});
