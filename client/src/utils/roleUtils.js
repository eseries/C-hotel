export const roleHierarchy = ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'];

export const canAccess = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};
