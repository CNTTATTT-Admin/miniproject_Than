import React, { useState } from "react";
import AppConfirmationModal from "@crema/components/AppConfirmationModal";
import IntlMessages from "@crema/helpers/IntlMessages";
import AddCardForm from "./AddCardForm";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import { StyledScrumBoardAppCardDrawer } from "./index.styled";
import { postDataApi, deleteDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  showCardDeletedNotification,
  showOperationErrorNotification,
} from "@crema/helpers/NotificationHelper";
import CardHeader from "./CardHeader";
import {
  AttachmentObjType,
  BoardObjType,
  CardListObjType,
  CardObjType,
} from "@crema/types/models/apps/ScrumbBoard";

type AddCardProps = {
  isModalVisible: boolean;
  handleCancel: () => void;
  setData: (data: BoardObjType) => void;
  board: BoardObjType;
  list: CardListObjType | null;
  selectedCard: CardObjType | null;
  setSelectedCard: (data: CardObjType) => void;
  refreshTrigger?: number;
};

const AddCard: React.FC<AddCardProps> = ({
  isModalVisible,
  handleCancel,
  board,
  list,
  selectedCard,
  setData,
  refreshTrigger,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const { user } = useAuthUser();

  const [checkedList, setCheckedList] = useState(() => {
    const list = selectedCard?.checkedList;
    return Array.isArray(list) ? list : [];
  });

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedMembers, setMembersList] = useState(() => {
    const members = selectedCard?.members;
    return Array.isArray(members) ? members : [];
  });

  const [selectedLabels, setSelectedLabels] = useState(() => {
    const labels = selectedCard?.label;
    return Array.isArray(labels) ? labels : [];
  });

  const [comments, setComments] = useState(() => {
    const commentList = selectedCard?.comments;
    return Array.isArray(commentList) ? commentList : [];
  });

  const [attachments, setAttachments] = useState(() => {
    const attachmentList = selectedCard?.attachments;
    return Array.isArray(attachmentList) ? attachmentList : [];
  });

  const onAddAttachments = (files: AttachmentObjType[]) => {
    setAttachments([...attachments, ...files]);
  };

  const onDeleteCard = () => {
    const listId = list!.id;
    const cardId = selectedCard!.id;
    const cardTitle = selectedCard?.title || "Card";

    // Optimistically update local state
    const updatedBoard = {
      ...board,
      list: (board.list || []).map((ln) => {
        if (ln.id !== listId) return ln;
        const safeCards = Array.isArray(ln.cards) ? ln.cards : [];
        return { ...ln, cards: safeCards.filter((c) => c.id !== cardId) };
      }),
    } as any;
    setData(updatedBoard);

    // Sync backend
    deleteDataApi<string>("/scrumboard/delete/card", infoViewActionsContext, {
      id: cardId,
    })
      .then(() => {
        showCardDeletedNotification(cardTitle);
      })
      .catch((error) => {
        showOperationErrorNotification("delete card", error.message);
      });

    setDeleteDialogOpen(false);
    handleCancel();
  };

  const onClickDeleteIcon = () => {
    if (selectedCard) {
      setDeleteDialogOpen(true);
    } else {
      handleCancel();
    }
  };
  return (
    <StyledScrumBoardAppCardDrawer
      open={isModalVisible}
      width="80%"
      title={
        <CardHeader
          onAddAttachments={onAddAttachments}
          onClickDeleteIcon={onClickDeleteIcon}
          handleCancel={handleCancel}
          board={board}
          list={list}
        />
      }
      onClose={handleCancel}
    >
      <AddCardForm
        board={board}
        list={list}
        checkedList={checkedList}
        handleCancel={handleCancel}
        setCheckedList={setCheckedList}
        comments={comments}
        setComments={setComments}
        authUser={user}
        attachments={attachments}
        setAttachments={setAttachments}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
        selectedMembers={selectedMembers}
        setMembersList={setMembersList}
        selectedCard={selectedCard}
        onCloseAddCard={handleCancel}
        setData={setData}
        refreshTrigger={refreshTrigger}
      />

      {isDeleteDialogOpen ? (
        <AppConfirmationModal
          open={isDeleteDialogOpen}
          onDeny={setDeleteDialogOpen}
          onConfirm={onDeleteCard}
          modalTitle={<IntlMessages id="scrumboard.deleteCard" />}
          paragraph={<IntlMessages id="common.deleteItem" />}
        />
      ) : null}
    </StyledScrumBoardAppCardDrawer>
  );
};

export default AddCard;
