/**
 * Permission Service - Quản lý quyền hạn và roles trong hệ thống
 */

export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN', 
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: TeamRole;
  joinedAt: string;
  lastActive?: string;
  boards?: number;
  tasks?: number;
}

export interface BoardMember {
  id: number;
  memberId: number;
  boardId: number;
  role: TeamRole;
  joinedAt: string;
  member: TeamMember;
}

export interface Permission {
  canEditBoard: boolean;
  canDeleteBoard: boolean;
  canManageMembers: boolean;
  canEditCards: boolean;
  canMoveCards: boolean;
  canDeleteCards: boolean;
  canViewBoard: boolean;
  canInviteMembers: boolean;
  canChangeRoles: boolean;
}

class PermissionService {
  /**
   * Lấy quyền hạn dựa trên role
   */
  getPermissions(role: TeamRole): Permission {
    switch (role) {
      case TeamRole.OWNER:
        return {
          canEditBoard: true,
          canDeleteBoard: true,
          canManageMembers: true,
          canEditCards: true,
          canMoveCards: true,
          canDeleteCards: true,
          canViewBoard: true,
          canInviteMembers: true,
          canChangeRoles: true,
        };
      
      case TeamRole.ADMIN:
        return {
          canEditBoard: true,
          canDeleteBoard: false,
          canManageMembers: true,
          canEditCards: true,
          canMoveCards: true,
          canDeleteCards: true,
          canViewBoard: true,
          canInviteMembers: true,
          canChangeRoles: true,
        };
      
      case TeamRole.MEMBER:
        return {
          canEditBoard: false,
          canDeleteBoard: false,
          canManageMembers: false,
          canEditCards: true,
          canMoveCards: true,
          canDeleteCards: false,
          canViewBoard: true,
          canInviteMembers: false,
          canChangeRoles: false,
        };
      
      case TeamRole.VIEWER:
        return {
          canEditBoard: false,
          canDeleteBoard: false,
          canManageMembers: false,
          canEditCards: false,
          canMoveCards: false,
          canDeleteCards: false,
          canViewBoard: true,
          canInviteMembers: false,
          canChangeRoles: false,
        };
      
      default:
        return {
          canEditBoard: false,
          canDeleteBoard: false,
          canManageMembers: false,
          canEditCards: false,
          canMoveCards: false,
          canDeleteCards: false,
          canViewBoard: false,
          canInviteMembers: false,
          canChangeRoles: false,
        };
    }
  }

  /**
   * Kiểm tra xem user có quyền thực hiện hành động không
   */
  hasPermission(role: TeamRole, action: keyof Permission): boolean {
    const permissions = this.getPermissions(role);
    return permissions[action];
  }

  /**
   * Kiểm tra xem user có thể thay đổi role của user khác không
   */
  canChangeRole(currentUserRole: TeamRole, targetUserRole: TeamRole, newRole: TeamRole): boolean {
    // Owner có thể thay đổi tất cả roles
    if (currentUserRole === TeamRole.OWNER) {
      return true;
    }

    // Admin có thể thay đổi member và viewer, nhưng không thể thay đổi owner
    if (currentUserRole === TeamRole.ADMIN) {
      return targetUserRole !== TeamRole.OWNER && newRole !== TeamRole.OWNER;
    }

    // Member và Viewer không thể thay đổi roles
    return false;
  }

  /**
   * Kiểm tra xem user có thể xóa user khác không
   */
  canRemoveMember(currentUserRole: TeamRole, targetUserRole: TeamRole): boolean {
    // Không thể xóa chính mình
    if (currentUserRole === targetUserRole) {
      return false;
    }

    // Owner có thể xóa tất cả
    if (currentUserRole === TeamRole.OWNER) {
      return true;
    }

    // Admin có thể xóa member và viewer, nhưng không thể xóa owner
    if (currentUserRole === TeamRole.ADMIN) {
      return targetUserRole !== TeamRole.OWNER;
    }

    return false;
  }

  /**
   * Lấy danh sách roles có thể assign cho user khác
   */
  getAssignableRoles(currentUserRole: TeamRole): TeamRole[] {
    switch (currentUserRole) {
      case TeamRole.OWNER:
        return [TeamRole.ADMIN, TeamRole.MEMBER, TeamRole.VIEWER];
      
      case TeamRole.ADMIN:
        return [TeamRole.MEMBER, TeamRole.VIEWER];
      
      default:
        return [];
    }
  }

  /**
   * Lấy role hierarchy (cao nhất = 0)
   */
  getRoleHierarchy(role: TeamRole): number {
    switch (role) {
      case TeamRole.OWNER:
        return 0;
      case TeamRole.ADMIN:
        return 1;
      case TeamRole.MEMBER:
        return 2;
      case TeamRole.VIEWER:
        return 3;
      default:
        return 999;
    }
  }

  /**
   * Kiểm tra xem role A có cao hơn role B không
   */
  isHigherRole(roleA: TeamRole, roleB: TeamRole): boolean {
    return this.getRoleHierarchy(roleA) < this.getRoleHierarchy(roleB);
  }
}

export const permissionService = new PermissionService();
export default permissionService;

