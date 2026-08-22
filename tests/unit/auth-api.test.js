import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginApi, logoutApi, refreshTokenApi, getCurrentUserApi } from '../../src/lib/api/auth.api.js';
import {
  getEmployeesApi,
  createEmployeeApi,
  changeEmployeePasswordApi,
  changeEmployeeRoleApi,
  forceLogoutEmployeeApi,
  deleteEmployeeApi,
} from '../../src/lib/api/employees.api.js';
import { getRolesApi, createRoleApi, getPermissionsCatalogApi } from '../../src/lib/api/roles.api.js';
import { apiClient } from '../../src/lib/api-client.js';

describe('Module 2 API Functions Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loginApi should send POST to /auth/login with forceLogout flag', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ success: true });

    await loginApi({ email: 'admin@restaurant.com', password: 'password123', forceLogout: true });

    expect(postSpy).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@restaurant.com',
      password: 'password123',
      forceLogout: true,
    });
  });

  it('getCurrentUserApi should call GET /auth/me', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ id: 'emp-1' });

    await getCurrentUserApi();

    expect(getSpy).toHaveBeenCalledWith('/auth/me');
  });

  it('refreshTokenApi should send the refresh token without an auth header', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ accessToken: 'new' });

    await refreshTokenApi('refresh-abc');

    expect(postSpy).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh-abc' }, { skipAuth: true });
  });

  it('employees API functions should call correct endpoints with params and payload', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ items: [] });
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'emp-new' });
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ id: 'emp-1' });
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({ success: true });

    await getEmployeesApi({ roleId: 'role-1' });
    expect(getSpy).toHaveBeenCalledWith('/employees', { params: { roleId: 'role-1' } });

    await createEmployeeApi({ name: 'موظف' });
    expect(postSpy).toHaveBeenCalledWith('/employees', { name: 'موظف' });

    await changeEmployeePasswordApi('emp-1', { newPassword: 'secret123' });
    expect(patchSpy).toHaveBeenCalledWith('/employees/emp-1/password', { newPassword: 'secret123' });

    await changeEmployeeRoleApi('emp-1', { roleId: 'role-2' });
    expect(patchSpy).toHaveBeenCalledWith('/employees/emp-1/role', { roleId: 'role-2' });

    await forceLogoutEmployeeApi('emp-1');
    expect(postSpy).toHaveBeenCalledWith('/auth/force-logout', { employeeId: 'emp-1' });

    await deleteEmployeeApi('emp-1');
    expect(deleteSpy).toHaveBeenCalledWith('/employees/emp-1');
  });

  it('roles API functions should call correct endpoints', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ items: [] });
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'role-new' });

    await getRolesApi();
    expect(getSpy).toHaveBeenCalledWith('/roles', { params: {} });

    await createRoleApi({ name: 'كاشير' });
    expect(postSpy).toHaveBeenCalledWith('/roles', { name: 'كاشير' });

    await getPermissionsCatalogApi();
    expect(getSpy).toHaveBeenCalledWith('/roles/permissions/catalog');
  });
});