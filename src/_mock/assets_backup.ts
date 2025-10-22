// Stub file - Mock assets removed, using real backend
// Kept for template compatibility only

type DBUser = { id: string; username: string; password: string };
type DBMenu = { id: string; parentId: string; name: string; code: string; type: number };
type DBPermission = { id: string; name: string };
type DBRole = { id: string; name: string };
type DBUserRole = { userId: string; roleId: string };
type DBRolePermission = { roleId: string; permissionId: string };

export const DB_USER: DBUser[] = [];
export const DB_MENU: DBMenu[] = [];
export const DB_PERMISSION: DBPermission[] = [];
export const DB_ROLE: DBRole[] = [];
export const DB_USER_ROLE: DBUserRole[] = [];
export const DB_ROLE_PERMISSION: DBRolePermission[] = [];
