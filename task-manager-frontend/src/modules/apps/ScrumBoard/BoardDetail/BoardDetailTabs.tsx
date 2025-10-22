import React from "react";
import { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";
import BoardDetailView from "./BoardDetailView";

interface BoardDetailTabsProps {
  boardDetail: BoardObjType;
  setData: (data: BoardObjType) => void;
}

const BoardDetailTabs: React.FC<BoardDetailTabsProps> = ({
  boardDetail,
  setData,
}) => {
  return <BoardDetailView boardDetail={boardDetail} setData={setData} />;
};

export default BoardDetailTabs;
