import { describe, it, expect } from 'vitest';
import { parseRestaurantSlug } from '../../src/shared/tenant/tenant.js';

describe('parseRestaurantSlug — the restaurant a host belongs to', () => {
  it('reads the restaurant from a subdomain', () => {
    expect(parseRestaurantSlug('prime-restaurant.localhost')).toBe('prime-restaurant');
    expect(parseRestaurantSlug('prime-restaurant.example.com')).toBe('prime-restaurant');
    expect(parseRestaurantSlug('prime-restaurant.localhost:5173')).toBe('prime-restaurant');
  });

  it('returns null on hosts without a restaurant', () => {
    expect(parseRestaurantSlug('localhost')).toBeNull();
    expect(parseRestaurantSlug('localhost:5173')).toBeNull();
    expect(parseRestaurantSlug('127.0.0.1')).toBeNull();
    expect(parseRestaurantSlug('example.com')).toBeNull();
    expect(parseRestaurantSlug('www.example.com')).toBeNull();
    expect(parseRestaurantSlug('')).toBeNull();
    expect(parseRestaurantSlug(undefined)).toBeNull();
  });

  it('is case-insensitive and ignores a trailing dot', () => {
    expect(parseRestaurantSlug('Prime-Restaurant.LOCALHOST')).toBe('prime-restaurant');
    expect(parseRestaurantSlug('prime-restaurant.example.com.')).toBe('prime-restaurant');
  });

  it('rejects labels that cannot be a restaurant slug', () => {
    expect(parseRestaurantSlug('prime_restaurant.localhost')).toBeNull();
    expect(parseRestaurantSlug('api.example.com')).toBeNull();
  });
});
