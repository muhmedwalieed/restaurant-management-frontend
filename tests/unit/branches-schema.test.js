import { describe, it, expect } from 'vitest';
import { restaurantProfileSchema } from '../../src/modules/restaurant/pages/RestaurantSettingsPage.jsx';
import { branchFormSchema } from '../../src/modules/branches/components/BranchFormModal.jsx';
import {
  singleWorkingHourSchema,
  workingHoursSchema,
} from '../../src/modules/branches/components/WorkingHoursEditor.jsx';
import { branchSettingsSchema } from '../../src/modules/branches/components/BranchSettingsForm.jsx';

describe('Module 3 Zod Schemas Unit Tests', () => {
  it('restaurantProfileSchema should validate correct restaurant profile data', () => {
    const validData = {
      name: 'مطعم البرجر الشهي',
      email: 'info@burger.com',
      phone: '01012345678',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
    };
    const res = restaurantProfileSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('restaurantProfileSchema should reject invalid email or short name', () => {
    const invalidData = {
      name: 'أ',
      email: 'invalid-email',
      phone: '123',
      currency: 'E',
      timezone: 'UTC',
    };
    const res = restaurantProfileSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it('branchFormSchema should validate valid branch data', () => {
    const validBranch = {
      name: 'فرع مدينة نصر',
      code: 'MN-01',
      address: '15 شارع النصر',
      phone: '01012345678',
      status: 'ACTIVE',
      isMain: true,
    };
    const res = branchFormSchema.safeParse(validBranch);
    expect(res.success).toBe(true);
  });

  it('singleWorkingHourSchema should validate correct HH:mm time format and enum day', () => {
    const validHour = {
      day: 'SAT',
      openTime: '09:00',
      closeTime: '23:30',
      isOpen: true,
    };
    const res = singleWorkingHourSchema.safeParse(validHour);
    expect(res.success).toBe(true);
  });

  it('singleWorkingHourSchema should reject invalid time format (e.g. 9:00 or 25:00)', () => {
    const invalidHour = {
      day: 'SAT',
      openTime: '9:00',
      closeTime: '25:00',
      isOpen: true,
    };
    const res = singleWorkingHourSchema.safeParse(invalidHour);
    expect(res.success).toBe(false);
  });

  it('workingHoursSchema should validate 7-day schedule array', () => {
    const schedule = [
      { day: 'SAT', openTime: '09:00', closeTime: '23:00', isOpen: true },
      { day: 'SUN', openTime: '09:00', closeTime: '23:00', isOpen: true },
      { day: 'MON', openTime: '09:00', closeTime: '23:00', isOpen: true },
      { day: 'TUE', openTime: '09:00', closeTime: '23:00', isOpen: true },
      { day: 'WED', openTime: '09:00', closeTime: '23:00', isOpen: true },
      { day: 'THU', openTime: '09:00', closeTime: '23:00', isOpen: true },
      { day: 'FRI', openTime: '13:00', closeTime: '23:00', isOpen: true },
    ];
    const res = workingHoursSchema.safeParse(schedule);
    expect(res.success).toBe(true);
  });

  it('branchSettingsSchema should validate currency and timezone', () => {
    const validSettings = {
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
    };
    const res = branchSettingsSchema.safeParse(validSettings);
    expect(res.success).toBe(true);
  });
});
