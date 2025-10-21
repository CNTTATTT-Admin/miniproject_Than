import React, { useState } from "react";
import { Avatar, Tag, Button, Dropdown, message, Modal } from "antd";
import {
  MailOutlined,
  MoreOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  StyledMemberCard,
  StyledMemberInfo,
  StyledMemberStats,
} from "./index.styled";
import { TeamMember, TeamRole } from "@crema/services/PermissionService";
import {
  getRoleColor,
  getRoleIcon,
  getRoleDisplayName,
} from "@crema/helpers/roleUtils";
import { boardMemberService } from "@crema/services/BoardMemberService";

type MemberCardProps = {
  member: TeamMember;
  currentUserRole: TeamRole;
  onMemberUpdate: () => void;
  boardId?: number; // Optional board ID for board-specific actions
};

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUserRole,
  onMemberUpdate,
  boardId,
}) => {
  const [loading, setLoading] = useState(false);

  const handleRemoveMember = async () => {
    const isBoardContext = boardId !== undefined;
    const title = isBoardContext ? "Remove from Board" : "Remove from Team";
    const content = isBoardContext
      ? `Are you sure you want to remove ${member.name} from this board?`
      : `Are you sure you want to remove ${member.name} from the team? This will remove them from all boards.`;

    Modal.confirm({
      title,
      content,
      onOk: async () => {
        try {
          if (isBoardContext) {
            await boardMemberService.removeBoardMember(boardId!, member.id);
            message.success("Member removed from board successfully");
          } else {
            // TODO: Implement removeTeamMember in boardMemberService
            message.error("Remove from team not implemented yet");
            return;
          }
          onMemberUpdate();
        } catch (error) {
          message.error("Failed to remove member");
        }
      },
    });
  };

  const getMenuItems = () => {
    const items = [];

    // Chỉ hiển thị delete nếu có quyền
    if (
      (currentUserRole === TeamRole.OWNER && member.role !== TeamRole.OWNER) ||
      (currentUserRole === TeamRole.ADMIN && member.role !== TeamRole.OWNER)
    ) {
      const removeLabel = boardId ? "Remove from Board" : "Remove from Team";
      items.push({
        key: "delete",
        label: removeLabel,
        icon: <DeleteOutlined />,
        danger: true,
        onClick: handleRemoveMember,
      });
    }

    return items;
  };

  return (
    <>
      <StyledMemberCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Avatar src={member.avatar} size={64} icon={<UserOutlined />} />
          {getMenuItems().length > 0 && (
            <Dropdown
              menu={{ items: getMenuItems() }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </div>

        <StyledMemberInfo>
          <h3>{member.name}</h3>
          <p>
            <MailOutlined /> {member.email}
          </p>
          <Tag color={getRoleColor(member.role)}>
            {getRoleIcon(member.role)} {getRoleDisplayName(member.role)}
          </Tag>
        </StyledMemberInfo>

        <StyledMemberStats>
          <div>
            <strong>{member.boards || 0}</strong>
            <span>Boards</span>
          </div>
          <div>
            <strong>{member.tasks || 0}</strong>
            <span>Tasks</span>
          </div>
        </StyledMemberStats>
      </StyledMemberCard>
    </>
  );
};

export default MemberCard;
