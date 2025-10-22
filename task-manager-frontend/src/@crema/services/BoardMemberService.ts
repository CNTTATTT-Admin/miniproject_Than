/**
 * BOARD MEMBER SERVICE - Real backend integration
 * Sử dụng backend APIs thực tế thay vì mock
 */

import { jwtAxios } from './auth/jwt-auth';

// ============================================================================
// TYPES
// ============================================================================

export interface BoardMember {
  id: number;
  memberId: number;
  boardId: number;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  member: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    lastActive?: string;
    boards?: number;
    tasks?: number;
  };
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  joinedAt?: string;
  lastActive?: string;
  boards?: number;
  tasks?: number;
}

// ============================================================================
// BOARD MEMBER SERVICE
// ============================================================================

class BoardMemberService {
  /**
   * Get board members from backend
   */
  public async getBoardMembers(boardId: number): Promise<BoardMember[]> {
    try {
      const response = await jwtAxios.get(`/scrumboard/member/${boardId}`);
      
      console.log('🔍 BoardMemberService.getBoardMembers response:', response.data);
      
      if (response.data && response.data.status) {
        // Convert backend response to frontend format
        const mappedMembers = response.data.data.map((member: any) => {
          console.log('🔍 Raw member data:', member);
          const mappedMember = {
            id: member.id,
            memberId: member.id, // Backend trả về id trực tiếp, không phải userId
            boardId: boardId, // Sử dụng boardId từ parameter
            role: member.role, // Backend trả về role trực tiếp
            joinedAt: member.joinedAt,
            member: {
              id: member.id,
              name: member.name,
              email: member.email,
              avatar: member.avatar,
              lastActive: member.lastActive,
              boards: member.boards || 0,
              tasks: member.tasks || 0,
              role: member.role, // Thêm role vào member object
              joinedAt: member.joinedAt, // Thêm joinedAt vào member object
            }
          };
          console.log('🔍 Mapped member data:', mappedMember);
          return mappedMember;
        });
        return mappedMembers;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get board members:', error);
      throw error;
    }
  }

  /**
   * Add member to board
   */
  public async addBoardMember(
    boardId: number, 
    userId: number, 
    role: 'OWNER' | 'MEMBER' = 'MEMBER'
  ): Promise<BoardMember> {
    try {
      const response = await jwtAxios.post(`/scrumboard/member/${boardId}/${userId}`, {
        role: role
      });
      
      if (response.data && response.data.status) {
        const member = response.data.data;
        return {
          id: member.id,
          memberId: member.userId,
          boardId: member.boardId,
          role: member.role,
          joinedAt: member.joinedAt,
          member: {
            id: member.userId,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
            lastActive: member.lastActive,
            boards: member.boards || 0,
            tasks: member.tasks || 0,
          }
        };
      }
      
      throw new Error('Failed to add board member');
    } catch (error) {
      console.error('Failed to add board member:', error);
      throw error;
    }
  }

  /**
   * Remove member from board
   */
  public async removeBoardMember(boardId: number, userId: number): Promise<boolean> {
    try {
      const response = await jwtAxios.delete(`/scrumboard/member/${boardId}/${userId}`);
      
      return response.data && response.data.status;
    } catch (error) {
      console.error('Failed to remove board member:', error);
      throw error;
    }
  }

  /**
   * Update member role
   */
  public async updateMemberRole(
    boardId: number, 
    userId: number, 
    role: 'OWNER' | 'MEMBER'
  ): Promise<BoardMember> {
    try {
      const response = await jwtAxios.put(`/scrumboard/member/${boardId}/${userId}/role`, null, {
        params: { role: role }
      });
      
      if (response.data && response.data.status) {
        const member = response.data.data;
        return {
          id: member.id,
          memberId: member.userId,
          boardId: member.boardId,
          role: member.role,
          joinedAt: member.joinedAt,
          member: {
            id: member.userId,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
            lastActive: member.lastActive,
            boards: member.boards || 0,
            tasks: member.tasks || 0,
          }
        };
      }
      
      throw new Error('Failed to update member role');
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  }

  /**
   * Get all available team members (for dropdown)
   * Since /users endpoint doesn't exist, return empty array for now
   */
  public async getAllTeamMembers(): Promise<TeamMember[]> {
    try {
      // TODO: Backend needs to implement /users endpoint
      // For now, return empty array to prevent 404 errors
      console.log('⚠️ getAllTeamMembers: /users endpoint not implemented yet');
      return [];
    } catch (error) {
      console.error('Failed to get all team members:', error);
      return [];
    }
  }

  /**
   * Search team members
   * Since /users/search endpoint doesn't exist, return empty array for now
   */
  public async searchTeamMembers(query: string): Promise<TeamMember[]> {
    try {
      // TODO: Backend needs to implement /users/search endpoint
      // For now, return empty array to prevent 404 errors
      console.log('⚠️ searchTeamMembers: /users/search endpoint not implemented yet');
      return [];
    } catch (error) {
      console.error('Failed to search team members:', error);
      return [];
    }
  }
}

// Export singleton instance
export const boardMemberService = new BoardMemberService();
export default boardMemberService;
