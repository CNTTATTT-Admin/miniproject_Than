/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import AddCard from "./List/AddCard";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import "./react-trello.d";
import Board from "react-trello";
import { postDataApi, putDataApi, deleteDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { useThemeContext } from "@crema/context/AppContextProvider/ThemeContextProvider";
import BoardCard from "./List/BoardCard";
import ListHeader from "./List/ListHeader";
import AddCardButton from "./List/AddCardButton";
import AddNewList from "./AddNewList";
import NewListButton from "./NewListButton";
import {
  showCardMovedNotification,
  showCardCreatedNotification,
  showListCreatedNotification,
  showListUpdatedNotification,
  showOperationErrorNotification,
} from "@crema/helpers/NotificationHelper";
import type {
  BoardObjType,
  CardListObjType,
  CardObjType,
} from "@crema/types/models/apps/ScrumbBoard";
import { useWebSocket } from "@crema/hooks/useWebSocket";
import ConnectionStatusIndicator from "@crema/components/ConnectionStatusIndicator";

type BoardDetailViewProps = {
  boardDetail: BoardObjType;
  setData: (data: BoardObjType) => void;
};

const BoardDetailView: React.FC<BoardDetailViewProps> = ({
  boardDetail,
  setData,
}) => {
  const [list, setList] = useState<CardListObjType | null>(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  const { theme } = useThemeContext();
  const [isAddCardOpen, setAddCardOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedCard, setSelectedCard] = useState<CardObjType | null>(null);

  // WebSocket integration - chỉ để sync real-time, API vẫn bắt buộc
  const { status: wsStatus, isConnected } = useWebSocket({
    boardId: boardDetail?.id?.toString(),
    enabled: !!boardDetail?.id,
    onCardCreated: (message) => {
      console.log("Card created via WebSocket:", message);
      // Thêm card mới vào UI real-time
      if (message.data && message.data.laneId) {
        setData((currentBoard) => {
          const updatedBoard = {
            ...currentBoard,
            list: currentBoard.list.map((lane) => {
              if (lane.id.toString() === message.data.laneId.toString()) {
                // Thêm card mới vào lane
                const cardWithLaneId = { ...message.data, laneId: lane.id };
                return {
                  ...lane,
                  cards: [...lane.cards, cardWithLaneId],
                };
              }
              return lane;
            }),
          };

          // Show notification cho user khác
          const targetLane = currentBoard.list.find(
            (l) => l.id.toString() === message.data.laneId.toString()
          );
          if (targetLane) {
            showCardCreatedNotification(message.data.title || "Card");
          }

          return updatedBoard;
        });
      }
    },
    onCardDeleted: (message) => {
      console.log("Card deleted via WebSocket:", message);
      // Xóa card khỏi UI real-time
      setData((currentBoard) => ({
        ...currentBoard,
        list: currentBoard.list.map((lane) => ({
          ...lane,
          cards: lane.cards.filter(
            (card) => card.id.toString() !== message.cardId
          ),
        })),
      }));
    },
    onCardUpdated: (message) => {
      console.log("Card updated via WebSocket:", message);
      // Cập nhật card trong UI real-time
      if (message.data) {
        setData((currentBoard) => ({
          ...currentBoard,
          list: currentBoard.list.map((lane) => ({
            ...lane,
            cards: lane.cards.map((c) =>
              c.id.toString() === message.cardId ? { ...c, ...message.data } : c
            ),
          })),
        }));
      }
    },
    onCardMoved: (message) => {
      console.log("Card moved via WebSocket:", message);
      // Di chuyển card giữa các lists real-time
      if (message.data && message.fromListId && message.toListId) {
        // Sử dụng setData với callback để đảm bảo có state mới nhất
        setData((currentBoard) => {
          const updatedBoard = {
            ...currentBoard,
            list: currentBoard.list.map((lane) => {
              if (lane.id.toString() === message.fromListId) {
                // Xóa card khỏi source lane
                return {
                  ...lane,
                  cards: lane.cards.filter(
                    (c) => c.id.toString() !== message.cardId
                  ),
                };
              } else if (lane.id.toString() === message.toListId) {
                // Thêm card vào destination lane với position đúng
                const cardWithLaneId = { ...message.data, laneId: lane.id };
                return {
                  ...lane,
                  cards: [...lane.cards, cardWithLaneId],
                };
              }
              return lane;
            }),
          };

          // Show notification cho user khác
          const sourceLane = currentBoard.list.find(
            (l) => l.id.toString() === message.fromListId
          );
          const targetLane = currentBoard.list.find(
            (l) => l.id.toString() === message.toListId
          );
          if (sourceLane && targetLane) {
            showCardMovedNotification(
              message.data.title || "Card",
              sourceLane.name || "Source",
              targetLane.name || "Target"
            );
          }

          return updatedBoard;
        });
      }
    },
  });

  const getBoardData = useCallback(() => {
    // Ensure each card has laneId for react-trello compatibility
    // This prevents "Cannot set properties of null (setting 'laneId')" error
    // Note: react-trello may temporarily create null cards during drag & drop operations
    // We silently filter them out without logging warnings
    const lanesWithLaneId = Array.isArray(boardDetail?.list)
      ? boardDetail.list
          .map((lane) => {
            // Ensure lane has valid structure
            if (!lane || typeof lane.id === "undefined") {
              return null;
            }

            const safeCards = Array.isArray(lane.cards)
              ? lane.cards
                  .map((card) => {
                    // Silently skip invalid cards (common during react-trello drag operations)
                    if (!card || typeof card.id === "undefined") {
                      return null;
                    }
                    return {
                      ...card,
                      laneId: lane.id, // Add laneId to each card
                    };
                  })
                  .filter(
                    (card): card is CardObjType & { laneId: number } =>
                      card !== null
                  ) // Remove null entries with type guard
              : [];

            return {
              ...lane,
              cards: safeCards,
            };
          })
          .filter(
            (
              lane
            ): lane is CardListObjType & {
              cards: (CardObjType & { laneId: number })[];
            } => lane !== null
          ) // Remove null entries with type guard
      : [];

    // Clean the board data to remove any invalid properties that might cause react-trello issues
    const cleanBoardData = {
      id: boardDetail?.id,
      name: boardDetail?.name,
      lanes: lanesWithLaneId,
    };

    // Remove any undefined or invalid properties
    Object.keys(cleanBoardData).forEach((key) => {
      if (cleanBoardData[key as keyof typeof cleanBoardData] === undefined) {
        delete cleanBoardData[key as keyof typeof cleanBoardData];
      }
    });

    return cleanBoardData;
  }, [boardDetail]);

  const [boardData, setBoardData] = useState(getBoardData());

  useEffect(() => {
    const newBoardData = getBoardData();
    setBoardData(newBoardData);
  }, [boardDetail, getBoardData]);

  // Sync boardData with boardDetail changes
  useEffect(() => {
    if (boardDetail && boardDetail.list) {
      const newBoardData = getBoardData();
      setBoardData(newBoardData);
    }
  }, [boardDetail, getBoardData]);

  const shouldReceiveNewData = (nextData: any) => {
    // This is called by react-trello when user drags cards or makes changes
    // We MUST update state here for react-trello to work properly
    if (!nextData || !nextData.lanes) {
      setBoardData(nextData);
      return;
    }

    const cleanedData = {
      ...nextData,
      lanes: Array.isArray(nextData.lanes)
        ? nextData.lanes.map((lane: any) => {
            if (!lane) return lane;

            // Filter out null/invalid cards silently
            // This is normal during react-trello drag & drop operations
            const validCards = Array.isArray(lane.cards)
              ? lane.cards.filter(
                  (card: any) => card && typeof card.id !== "undefined"
                )
              : [];

            return {
              ...lane,
              cards: validCards,
            };
          })
        : [],
    };

    // Update local state for immediate UI feedback
    setBoardData(cleanedData);
  };

  const onCloseAddCard = () => {
    setAddCardOpen(false);
  };

  const triggerMemberRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Trigger member refresh when board changes (only once)
  useEffect(() => {
    if (boardDetail.id) {
      triggerMemberRefresh();
    }
  }, [boardDetail.id]);

  // Expose refresh function globally for team management
  useEffect(() => {
    // Store refresh function in window object for team management to use
    (window as any).refreshScrumBoardMembers = triggerMemberRefresh;

    return () => {
      // Cleanup on unmount
      delete (window as any).refreshScrumBoardMembers;
    };
  }, []);

  const onClickAddCard = (listId: number) => {
    setList(boardData!.lanes!.find((item) => item.id === listId)!);
    setSelectedCard(null);
    setAddCardOpen(true);
  };

  const onAddList = (name: string) => {
    postDataApi("/scrumboard/add/list", infoViewActionsContext, {
      name: name,
      boardId: boardDetail?.id,
    })
      .then((data) => {
        // Update local state instead of relying on API response
        const newList = data as CardListObjType;
        const updatedBoard = {
          ...boardDetail,
          list: [...(boardDetail.list || []), newList],
        };
        if (setData) setData(updatedBoard);
        showListCreatedNotification(name);
      })
      .catch((error) => {
        showOperationErrorNotification("add list", error.message);
      });
  };

  const getCardById = (lane: CardListObjType, cardId: number) => {
    const safeCards = Array.isArray(lane?.cards) ? lane.cards : [];
    return safeCards.find((item) => item.id === cardId);
  };

  const onEditCardDetail = (cardId: number) => {
    const safeLanes = Array.isArray(boardData?.lanes) ? boardData.lanes : [];
    const selectedList = safeLanes.find((item) => {
      const safeCards = Array.isArray(item?.cards) ? item.cards : [];
      const correctCard = safeCards.find((card) => card.id === cardId);
      if (correctCard) return item;
    });
    const selectedCard = getCardById(selectedList as CardListObjType, cardId);
    setSelectedCard(selectedCard as CardObjType);
    setList(selectedList as CardListObjType);
    setAddCardOpen(true);
  };

  const handleDragCard = (
    cardId: string | number,
    sourceLaneId: string | number,
    targetLaneId: string | number,
    position: number,
    _cardDetails: any
  ) => {
    // Only act if lane actually changed
    if (sourceLaneId === targetLaneId) return;

    const numericCardId = Number(cardId);
    const numericSourceId = Number(sourceLaneId);
    const numericTargetId = Number(targetLaneId);

    const currentLanes = Array.isArray(boardData?.lanes) ? boardData.lanes : [];
    const sourceLane = currentLanes.find((l) => l.id === numericSourceId);
    const targetLane = currentLanes.find((l) => l.id === numericTargetId);
    if (!sourceLane || !targetLane) return;

    const sourceCards = Array.isArray(sourceLane.cards)
      ? [...sourceLane.cards]
      : [];
    const movingCardIdx = sourceCards.findIndex((c) => c.id === numericCardId);
    if (movingCardIdx < 0) return;

    const [movingCard] = sourceCards.splice(movingCardIdx, 1);

    const targetCards = Array.isArray(targetLane.cards)
      ? [...targetLane.cards]
      : [];
    const safePos = Math.max(0, Math.min(position, targetCards.length));
    targetCards.splice(safePos, 0, { ...movingCard, laneId: numericTargetId });

    console.log(
      `Card move: ${numericCardId} from ${numericSourceId} to ${numericTargetId}, WebSocket connected: ${isConnected}`
    );

    // Chỉ update UI ngay lập tức nếu WebSocket không connected
    // Nếu WebSocket connected, để WebSocket handle UI update
    if (!isConnected) {
      console.log("WebSocket not connected, updating UI immediately");
      // Update local board state first for instant UX
      setData((currentBoard) => ({
        ...currentBoard,
        list: (currentBoard.list || []).map((ln) => {
          if (ln.id === numericSourceId)
            return { ...ln, cards: sourceCards } as CardListObjType;
          if (ln.id === numericTargetId)
            return { ...ln, cards: targetCards } as CardListObjType;
          return ln;
        }),
      }));
    } else {
      console.log(
        "WebSocket connected, skipping immediate UI update - will be handled by WebSocket"
      );
    }

    // Always sync to backend
    putDataApi<unknown>(
      "/scrumboard/cards/update/category",
      infoViewActionsContext,
      {
        cardId: numericCardId,
        laneId: numericTargetId,
      }
    )
      .then(() => {
        // Chỉ show notification nếu WebSocket không connected
        // Nếu WebSocket connected, notification sẽ được show trong WebSocket handler
        if (!isConnected) {
          showCardMovedNotification(
            movingCard?.title || "Card",
            sourceLane.name || "Source",
            targetLane.name || "Target"
          );
        }
      })
      .catch((error) => {
        // Rollback on error (optional)
        showOperationErrorNotification(
          "move card",
          error.message || "Failed to move card"
        );
        // Revert local changes on API failure
        if (!isConnected) {
          // Trigger a refresh to get the latest data from server
          setRefreshTrigger((prev) => prev + 1);
        }
      });
  };

  const onEditBoardList = (lane: CardListObjType, data: CardObjType) => {
    const newListName = data.title;
    putDataApi<CardListObjType>(
      "/scrumboard/edit/list",
      infoViewActionsContext,
      {
        id: lane.id,
        name: newListName,
      }
    )
      .then((data) => {
        // Update local state instead of relying on API response
        const updatedList = data as CardListObjType;
        const updatedBoard = {
          ...boardDetail,
          list: boardDetail.list.map((list) =>
            list.id === lane.id ? updatedList : list
          ),
        };
        if (setData) setData(updatedBoard);
        showListUpdatedNotification(newListName || "List");
      })
      .catch((error) => {
        showOperationErrorNotification("update list", error.message);
      });
  };

  const onDeleteSelectedList = (laneId: number) => {
    deleteDataApi<string>("/scrumboard/delete/list", infoViewActionsContext, {
      id: laneId,
    })
      .then(() => {
        // Update local state instead of relying on API response
        const updatedBoard = {
          ...boardDetail,
          list: boardDetail.list.filter((list) => list.id !== laneId),
        };
        if (setData) setData(updatedBoard);
        infoViewActionsContext.showMessage("List Deleted Successfully!");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <AppsContent fullView>
      {/* WebSocket Connection Status */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "8px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <ConnectionStatusIndicator status={wsStatus} />
      </div>

      <Board
        laneStyle={{
          backgroundColor: theme.palette.background.default,
        }}
        editable
        canAddLanes
        data={boardData}
        onDataChange={shouldReceiveNewData}
        handleDragEnd={handleDragCard}
        onCardAdd={(_: CardObjType, laneId: number) => {
          onClickAddCard(laneId);
        }}
        onCardClick={(cardId: number, _: any) => {
          onEditCardDetail(cardId);
        }}
        onLaneAdd={(name: string) => onAddList(name)}
        onLaneUpdate={(laneId: number, data: CardObjType) => {
          const lane = boardData.lanes.find((item) => item.id === laneId);
          if (lane) onEditBoardList(lane, data);
        }}
        onLaneDelete={(laneId: number) => onDeleteSelectedList(laneId)}
        t={(listId: number) => onClickAddCard(listId)}
        components={{
          Card: BoardCard,
          LaneHeader: ListHeader,
          AddCardLink: AddCardButton,
          NewLaneForm: AddNewList,
          NewLaneSection: NewListButton,
        }}
      />
      {isAddCardOpen && list ? (
        <AddCard
          isModalVisible={isAddCardOpen}
          handleCancel={onCloseAddCard}
          list={list}
          board={boardDetail}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          setData={setData}
          refreshTrigger={refreshTrigger}
        />
      ) : null}
    </AppsContent>
  );
};

export default BoardDetailView;
