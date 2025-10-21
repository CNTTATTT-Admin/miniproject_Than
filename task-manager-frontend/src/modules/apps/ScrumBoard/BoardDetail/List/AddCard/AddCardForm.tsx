/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { Avatar, Button, Col, Form, Input, Select } from "antd";
import AppRowContainer from "@crema/components/AppRowContainer";
import {
  StyledMultiSelect,
  StyledMultiSelectName,
  StyledScrumBoardAddCardForm,
  StyledScrumBoardAddCardFormContent,
  StyledScrumBoardAddCardFormFooter,
  StyledScrumBoardDatePicker,
  StyledScrumBoardScrollbar,
} from "./index.styled";
import { postDataApi, putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  showCardCreatedNotification,
  showCardUpdatedNotification,
  showOperationErrorNotification,
} from "@crema/helpers/NotificationHelper";
// import CardAttachments from "./CardAttachments";
// import CardComments from "./CardComments";
import type {
  AttachmentObjType,
  BoardObjType,
  CardListObjType,
  CardObjType,
  LabelObjType,
  MemberObjType,
} from "@crema/types/models/apps/ScrumbBoard";
import type { AuthUserType } from "@crema/types/models/AuthUser";
import { generateRandomUniqueNumber } from "@crema/helpers/Common";

const { Option } = Select;
const { TextArea } = Input;

type AddCardFormProps = {
  board: BoardObjType;
  list: CardListObjType | null;
  handleCancel: () => void;
  comments: any[];
  values?: any;
  setFieldValue?: (name: string, value: any) => void;
  setComments: (comments: any[]) => void;
  authUser: AuthUserType | null;
  attachments: AttachmentObjType[];
  setAttachments: (attachments: AttachmentObjType[]) => void;
  selectedLabels: LabelObjType[];
  setSelectedLabels: (lables: LabelObjType[]) => void;
  selectedMembers: MemberObjType[];
  setMembersList: (members: MemberObjType[]) => void;
  selectedCard: CardObjType | null;
  onCloseAddCard: () => void;
  isSubmitting?: boolean;
  setData?: (data: BoardObjType) => void;
  refreshTrigger?: number; // Add this prop to trigger refresh
};

const AddCardForm: React.FC<AddCardFormProps> = ({
  board,
  list,
  handleCancel,
  comments,
  setComments,
  setSelectedLabels,
  attachments,
  setAttachments,
  selectedLabels,
  selectedMembers,
  setMembersList,
  selectedCard,
  onCloseAddCard,
  isSubmitting,
  setData,
  refreshTrigger,
}) => {
  const { messages } = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  // TODO: Label API không tồn tại trong backend, sử dụng mock data
  const mockLabelList: LabelObjType[] = [
    { id: 1, name: "Bug", type: 1, color: "#FF6B6B" },
    { id: 2, name: "Feature", type: 2, color: "#4ECDC4" },
    { id: 3, name: "Enhancement", type: 3, color: "#45B7D1" },
    { id: 4, name: "Critical", type: 4, color: "#FFA07A" },
    { id: 5, name: "Low Priority", type: 5, color: "#98D8C8" },
  ];

  // Sử dụng mock data thay vì call API để tránh 404 error
  const labelList = mockLabelList;
  // Sử dụng API endpoint giống Team Management để lấy members
  const [{ apiData: rawMemberData }, { reCallAPI: refreshMembers }] =
    useGetDataApi<any>(`/scrumboard/member/${board.id}`, []);

  // Convert data format từ BoardMemberService format sang MemberObjType format
  const memberList = React.useMemo(() => {
    console.log("🔍 AddCardForm rawMemberData:", rawMemberData);

    if (!rawMemberData) {
      console.log("❌ No rawMemberData");
      return [];
    }

    // Check if rawMemberData is the response object with data property
    if (rawMemberData.data && Array.isArray(rawMemberData.data)) {
      console.log("✅ Found rawMemberData.data:", rawMemberData.data);
      return rawMemberData.data.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        lastActive: member.lastActive,
        boards: member.boards || 0,
        tasks: member.tasks || 0,
        role: member.role,
        joinedAt: member.joinedAt,
      }));
    }

    // Check if rawMemberData is already the array
    if (Array.isArray(rawMemberData)) {
      console.log("✅ rawMemberData is array:", rawMemberData);
      return rawMemberData.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        lastActive: member.lastActive,
        boards: member.boards || 0,
        tasks: member.tasks || 0,
        role: member.role,
        joinedAt: member.joinedAt,
      }));
    }

    console.log("❌ Unexpected rawMemberData format:", rawMemberData);
    return [];
  }, [rawMemberData]);

  // Debug logs removed

  // Refresh members when component mounts or board changes
  useEffect(() => {
    if (refreshMembers) {
      refreshMembers();
    }
  }, [board.id, refreshMembers]);

  // Also refresh when refreshTrigger changes (for manual refresh)
  useEffect(() => {
    if (refreshMembers && refreshTrigger && refreshTrigger > 0) {
      refreshMembers();
    }
  }, [refreshTrigger, refreshMembers]);

  const onFinish = (values: any) => {
    // Format date to dayjs object with MM-DD-YYYY format for consistency
    const formattedValues = {
      ...values,
      date:
        values.date && dayjs.isDayjs(values.date)
          ? values.date
          : values.date
            ? dayjs(values.date, "MM-DD-YYYY")
            : null,
    };

    if (selectedCard) {
      const safeMembers = Array.isArray(selectedMembers) ? selectedMembers : [];
      const safeLabels = Array.isArray(selectedLabels) ? selectedLabels : [];

      // Note: editedCard logic removed as it's not used
      putDataApi<BoardObjType>(
        "/scrumboard/edit/card",
        infoViewActionsContext,
        {
          id: selectedCard.id,
          title: values.title || "",
          description: values.desc || "",
          date: values.date || "",
          laneId: list?.id || 0,
          memberIds: safeMembers.map((member: any) => member.id),
          labelIds: safeLabels.map((label: any) => label.id),
        }
      )
        .then(() => {
          // Update local board state: replace the card inside the current list
          const updatedBoard = {
            ...board,
            list: (board.list || []).map((ln) => {
              if (ln.id !== (list?.id || 0)) return ln;
              const safeCards = Array.isArray(ln.cards) ? ln.cards : [];
              const updatedCards = safeCards.map((c) =>
                c.id === selectedCard.id
                  ? {
                      ...c,
                      title: values.title || "",
                      desc: values.desc || "",
                      date: values.date || "",
                      members: safeMembers,
                      label: safeLabels,
                    }
                  : c
              );
              return { ...ln, cards: updatedCards };
            }),
          } as BoardObjType;
          setData!(updatedBoard);
          handleCancel();
          showCardUpdatedNotification(values.title || "Card");
        })
        .catch((error) => {
          showOperationErrorNotification("update card", error.message);
        });
    } else {
      const safeComments = Array.isArray(comments) ? comments : [];
      const safeAttachments = Array.isArray(attachments) ? attachments : [];
      const safeMembers = Array.isArray(selectedMembers) ? selectedMembers : [];
      const safeLabels = Array.isArray(selectedLabels) ? selectedLabels : [];

      const newCard = {
        id: generateRandomUniqueNumber(),
        attachments: safeAttachments,
        checkedList: [],
        comments: safeComments,
        ...formattedValues,
        label: safeLabels,
        members: safeMembers,
      };
      // Note: newCard is kept for potential future use
      postDataApi<{ id: number } | unknown>(
        "/scrumboard/add/card",
        infoViewActionsContext,
        {
          title: values.title || "",
          description: values.desc || "",
          date: values.date || "",
          laneId: list?.id || 0,
          memberIds: safeMembers.map((member: any) => member.id),
          labelIds: safeLabels.map((label: any) => label.id),
        }
      )
        .then((resp) => {
          // Build new card using returned id if present
          const createdId = (resp as any)?.id || newCard.id;
          const createdCard = { ...newCard, id: createdId };

          // Update local board state: push new card into current list
          const updatedBoard = {
            ...board,
            list: (board.list || []).map((ln) => {
              if (ln.id !== (list?.id || 0)) return ln;
              const safeCards = Array.isArray(ln.cards) ? ln.cards : [];
              return { ...ln, cards: [...safeCards, createdCard] };
            }),
          } as BoardObjType;
          setData!(updatedBoard);

          // Reset form states / subtasks after success
          setComments([]);
          setAttachments([]);
          setSelectedLabels([]);
          setMembersList([]);

          handleCancel();
          showCardCreatedNotification(values.title || "Card");
        })
        .catch((error) => {
          showOperationErrorNotification("create card", error.message);
        });
    }
  };

  const updateLabelList = (values: any) => {
    const safeLabelList = Array.isArray(labelList) ? labelList : [];
    const safeValues = Array.isArray(values) ? values : [];
    setSelectedLabels(
      safeLabelList.filter((label: LabelObjType) =>
        safeValues.includes(label.id)
      )
    );
  };

  const updateMemberList = (values: any) => {
    const safeMemberList = Array.isArray(memberList) ? memberList : [];
    const safeValues = Array.isArray(values) ? values : [];
    setMembersList(
      safeMemberList.filter((member: MemberObjType) =>
        safeValues.includes(member.id)
      )
    );
  };

  // Parse date safely - handle both dayjs objects and string formats
  const parseCardDate = (date: any) => {
    if (!date) return null;

    // If it's already a dayjs object, return it
    if (dayjs.isDayjs(date)) return date;

    // Try to parse as string with MM-DD-YYYY format (database format)
    const parsed = dayjs(date, "MM-DD-YYYY", true);
    if (parsed.isValid()) return parsed;

    // Fallback: try to parse without strict format
    const fallback = dayjs(date);
    return fallback.isValid() ? fallback : null;
  };

  // Memoize initial values to prevent infinite re-renders
  const initialValues = useMemo(
    () => ({
      title: selectedCard?.title || "",
      desc: selectedCard?.desc || "",
      date: selectedCard?.date ? parseCardDate(selectedCard.date) : null,
      label: Array.isArray(selectedCard?.label)
        ? selectedCard.label.map((data) => data.id)
        : [],
      members: Array.isArray(selectedCard?.members)
        ? selectedCard.members.map((data) => data.id)
        : [],
    }),
    [
      selectedCard?.title,
      selectedCard?.desc,
      selectedCard?.date,
      selectedCard?.label,
      selectedCard?.members,
    ]
  );

  return (
    <StyledScrumBoardAddCardForm
      noValidate
      autoComplete="off"
      initialValues={initialValues}
      onFinish={onFinish}
    >
      <StyledScrumBoardScrollbar>
        <StyledScrumBoardAddCardFormContent>
          <AppRowContainer>
            <Col xs={24} md={16}>
              <Form.Item name="title">
                <Input placeholder={messages["common.title"] as string} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="date">
                <StyledScrumBoardDatePicker
                  key={`date-picker-${selectedCard?.id || "new"}`}
                  format="MM/DD/YYYY"
                  placeholder="Select date"
                  allowClear
                />
              </Form.Item>
            </Col>
          </AppRowContainer>

          <Form.Item name="desc">
            <TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              placeholder={messages["common.description"] as string}
            />
          </Form.Item>

          <AppRowContainer>
            <Col xs={24} lg={12}>
              <Form.Item name="label">
                <Select
                  mode="multiple"
                  allowClear
                  maxTagCount={3}
                  style={{ width: "100%" }}
                  placeholder="Please select Label"
                  onChange={(value) => updateLabelList(value)}
                >
                  {Array.isArray(labelList) &&
                    labelList.map((label: LabelObjType) => {
                      if (!label || !label.id) {
                        console.warn("Skipping invalid label:", label);
                        return null;
                      }
                      return (
                        <Option key={label.id} value={label.id}>
                          {label.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item name="members">
                <Select
                  mode="multiple"
                  maxTagCount={2}
                  placeholder="Please select Members"
                  onChange={(value) => updateMemberList(value)}
                >
                  {Array.isArray(memberList) && memberList.length > 0 ? (
                    memberList.map((member: MemberObjType) => {
                      if (!member || !member.id || !member.name) {
                        console.warn("Skipping invalid member:", member);
                        return null;
                      }
                      return (
                        <Option key={member.id} value={member.id}>
                          <StyledMultiSelect>
                            {member.avatar ? (
                              <Avatar src={member.avatar} />
                            ) : (
                              <Avatar>{member.name.toUpperCase()}</Avatar>
                            )}
                            <StyledMultiSelectName>
                              {member.name}
                            </StyledMultiSelectName>
                          </StyledMultiSelect>
                        </Option>
                      );
                    })
                  ) : (
                    <Option disabled value="no-members">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "8px",
                        }}
                      >
                        <div style={{ marginBottom: "8px", color: "#666" }}>
                          {memberList?.length === 0
                            ? "No members assigned to this board"
                            : "Loading members..."}
                        </div>
                        {memberList?.length === 0 && (
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              // Redirect to team management to add members
                              window.open(
                                `/collaboration/team?boardId=${board.id}`,
                                "_blank"
                              );
                            }}
                            style={{ fontSize: "12px", padding: "0" }}
                          >
                            Go to Team Management to add members
                          </Button>
                        )}
                      </div>
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </AppRowContainer>

          {/* Checklist feature disabled per request */}
        </StyledScrumBoardAddCardFormContent>
      </StyledScrumBoardScrollbar>
      <StyledScrumBoardAddCardFormFooter>
        <Button type="primary" ghost onClick={onCloseAddCard}>
          <IntlMessages id="common.cancel" />
        </Button>
        <Button type="primary" disabled={isSubmitting} htmlType="submit">
          <IntlMessages id="common.done" />
        </Button>
      </StyledScrumBoardAddCardFormFooter>
    </StyledScrumBoardAddCardForm>
  );
};
export default AddCardForm;
