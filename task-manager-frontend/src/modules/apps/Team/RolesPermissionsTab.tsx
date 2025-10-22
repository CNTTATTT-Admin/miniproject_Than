import React from "react";
import { Row, Col, Card, Tag, Typography, Space, Divider } from "antd";
import { TeamRole } from "@crema/services/PermissionService";
import {
  getRoleColor,
  getRoleIcon,
  getRoleDisplayName,
  getRoleDescription,
} from "@crema/helpers/roleUtils";
import { permissionService } from "@crema/services/PermissionService";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppScrollbar from "@crema/components/AppScrollbar";

const { Title, Text, Paragraph } = Typography;

const RolesPermissionsTab: React.FC = () => {
  const roles = [TeamRole.OWNER, TeamRole.MEMBER];

  const getPermissionList = (role: TeamRole) => {
    const permissions = permissionService.getPermissions(role);
    const permissionList = [];

    if (permissions.canEditBoard) permissionList.push("Edit Board");
    if (permissions.canDeleteBoard) permissionList.push("Delete Board");
    if (permissions.canManageMembers) permissionList.push("Manage Members");
    if (permissions.canEditCards) permissionList.push("Edit Cards");
    if (permissions.canMoveCards) permissionList.push("Move Cards");
    if (permissions.canDeleteCards) permissionList.push("Delete Cards");
    if (permissions.canViewBoard) permissionList.push("View Board");
    if (permissions.canInviteMembers) permissionList.push("Invite Members");
    if (permissions.canChangeRoles) permissionList.push("Change Roles");

    return permissionList;
  };

  return (
    <AppScrollbar style={{ height: "calc(100vh - 300px)" }}>
      <div style={{ padding: "32px 24px" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <Title level={2} style={{ marginBottom: 16, color: "#1f2937" }}>
            Roles & Permissions
          </Title>
          <Paragraph
            style={{
              fontSize: 16,
              color: "#6b7280",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Understanding the different roles and their permissions in your team
            workspace
          </Paragraph>
        </div>

        <Row gutter={[40, 40]} justify="center">
          {roles.map((role) => {
            const permissions = getPermissionList(role);
            const roleInfo = {
              name: getRoleDisplayName(role),
              icon: getRoleIcon(role),
              color: getRoleColor(role),
              description: getRoleDescription(role),
            };

            return (
              <Col key={role} xs={24} sm={24} md={12} lg={10} xl={8}>
                <Card
                  style={{
                    height: "100%",
                    border: `2px solid ${
                      role === TeamRole.OWNER ? "#ef4444" : "#10b981"
                    }`,
                    borderRadius: 20,
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "white",
                    overflow: "hidden",
                  }}
                  bodyStyle={{ padding: 0 }}
                  hoverable
                >
                  {/* Header with gradient */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${
                        role === TeamRole.OWNER
                          ? "#fef2f2 0%, #fee2e2 100%"
                          : "#f0fdf4 0%, #dcfce7 100%"
                      }`,
                      padding: "32px 32px 24px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 56,
                        marginBottom: 20,
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                      }}
                    >
                      {roleInfo.icon}
                    </div>
                    <Tag
                      color={roleInfo.color}
                      style={{
                        fontSize: 16,
                        padding: "8px 20px",
                        marginBottom: 16,
                        borderRadius: 16,
                        fontWeight: 600,
                        border: "none",
                      }}
                    >
                      {roleInfo.name}
                    </Tag>
                    <Text
                      style={{
                        fontSize: 15,
                        lineHeight: 1.5,
                        color: "#64748b",
                        display: "block",
                        marginTop: 8,
                      }}
                    >
                      {roleInfo.description}
                    </Text>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "24px 32px 32px" }}>
                    <Title
                      level={5}
                      style={{
                        marginBottom: 20,
                        textAlign: "center",
                        color: "#374151",
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      Permissions
                    </Title>
                    <Space
                      direction="vertical"
                      size={12}
                      style={{ width: "100%" }}
                    >
                      {permissions.map((permission, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "10px 16px",
                            backgroundColor: "#f8fafc",
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 500,
                            border: "1px solid #e2e8f0",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              color: "#10b981",
                              marginRight: 10,
                              fontSize: 14,
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                          {permission}
                        </div>
                      ))}
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        <div
          style={{
            marginTop: 64,
            padding: "40px 32px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 24,
            color: "white",
            boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
          }}
        >
          <Title
            level={3}
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: 40,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            📖 Usage Guide
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  padding: "28px 24px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "white", marginBottom: 16, fontSize: 20 }}
                >
                  👑 Owner
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  Owner Guide
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  padding: "28px 24px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "white", marginBottom: 16, fontSize: 20 }}
                >
                  👤 Member
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  Member Guide
                </Text>
              </div>
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: 32 }}>
            <Col xs={24} md={18}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  padding: "24px 28px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  textAlign: "center",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "white", marginBottom: 12, fontSize: 18 }}
                >
                  💡 Note
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  Always follow the principle of least privilege - only grant
                  the minimum permissions necessary for team members to perform
                  their tasks effectively.
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Security & Best Practices */}
        <div
          style={{
            marginTop: 48,
            padding: "40px 32px",
            backgroundColor: "#f8fafc",
            borderRadius: 20,
            border: "1px solid #e2e8f0",
          }}
        >
          <Title
            level={3}
            style={{
              textAlign: "center",
              marginBottom: 36,
              color: "#1e293b",
              fontSize: 24,
            }}
          >
            🔒 Security & Best Practices
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "28px 24px",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #e2e8f0",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "#1e293b", marginBottom: 16, fontSize: 18 }}
                >
                  🛡️ Principle of Least Privilege
                </Title>
                <Text
                  type="secondary"
                  style={{ fontSize: 15, lineHeight: 1.6, color: "#64748b" }}
                >
                  Always follow the principle of least privilege when assigning
                  roles. Start with minimal permissions and add more as needed.
                  Regularly review and audit team member permissions to ensure
                  they align with current responsibilities.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "28px 24px",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #e2e8f0",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "#1e293b", marginBottom: 16, fontSize: 18 }}
                >
                  📊 Role Management
                </Title>
                <Text
                  type="secondary"
                  style={{ fontSize: 15, lineHeight: 1.6, color: "#64748b" }}
                >
                  Monitor role usage and effectiveness. Track which permissions
                  are most commonly used and adjust role definitions
                  accordingly. Document role changes for audit purposes.
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        <div
          style={{
            marginTop: 48,
            padding: "40px 32px",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(251, 191, 36, 0.2)",
          }}
        >
          <Title
            level={3}
            style={{
              textAlign: "center",
              marginBottom: 32,
              color: "#92400e",
              fontSize: 24,
            }}
          >
            💡 Quick Tips
          </Title>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "24px 20px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  height: "100%",
                }}
              >
                <Title
                  level={5}
                  style={{ color: "#92400e", marginBottom: 16, fontSize: 16 }}
                >
                  🎯 For Owners
                </Title>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    Assign Member roles to trusted team members
                  </li>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    Regularly review team permissions
                  </li>
                  <li
                    style={{ fontSize: 14, lineHeight: 1.5, color: "#374151" }}
                  >
                    Keep Owner role limited to essential personnel
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "24px 20px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  height: "100%",
                }}
              >
                <Title
                  level={5}
                  style={{ color: "#92400e", marginBottom: 16, fontSize: 16 }}
                >
                  👥 For Members
                </Title>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    Focus on card management and collaboration
                  </li>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    Request permission upgrades when needed
                  </li>
                  <li
                    style={{ fontSize: 14, lineHeight: 1.5, color: "#374151" }}
                  >
                    Follow team guidelines for card organization
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </AppScrollbar>
  );
};

export default RolesPermissionsTab;
