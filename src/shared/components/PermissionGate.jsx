import React, { cloneElement, isValidElement } from 'react';
import { useAuth } from '../../modules/auth/context/AuthContext.jsx';

export const PermissionGate = ({
  children,
  permission,
  role,
  fallback = null,
  disableOnly = false,
}) => {
  const { user, hasPermission } = useAuth();

  if (!user) return fallback;

  let isAllowed = true;

  if (permission) {
    if (Array.isArray(permission)) {
      isAllowed = permission.some((p) => hasPermission(p));
    } else {
      isAllowed = hasPermission(permission);
    }
  }

  if (isAllowed && role) {
    const userRole = user.role?.name || user.role;
    if (Array.isArray(role)) {
      isAllowed = role.includes(userRole);
    } else {
      isAllowed = userRole === role;
    }
  }

  if (isAllowed) {
    return children;
  }

  if (disableOnly && isValidElement(children)) {
    return cloneElement(children, {
      disabled: true,
      'aria-disabled': true,
      className: `${children.props.className || ''} opacity-50 cursor-not-allowed pointer-events-none`,
      title: 'ليس لديك صلاحية لوصول هذا الإجراء',
    });
  }

  return fallback;
};
