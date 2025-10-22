import { useEffect } from "react";
import AppsContainer from "@crema/components/AppsContainer";
import BoardDetailTabs from "./BoardDetailTabs";
import { useNavigate, useParams } from "react-router-dom";
import { StyledScrumBoardDetailTitle } from "./index.styled";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Gọi trực tiếp GET /scrumboard/board/{id}
  const [{ apiData: boardDetail, loading }, { setData }] =
    useGetDataApi<BoardObjType>(
      `/scrumboard/board/${id}`,
      undefined,
      undefined,
      true
    );

  // Debug API call
  useEffect(() => {
    // Intentionally left blank: removed debug logs
  }, [id, loading, boardDetail]);

  useEffect(() => {
    // URL đã có ID trong path, không cần setQueryParams
    return () => {
      // Cleanup nếu cần
    };
  }, [id]);

  const onGoToBoardList = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <AppsContainer
        fullView
        noContentAnimation
        title={
          <>
            <StyledScrumBoardDetailTitle onClick={onGoToBoardList}>
              Scrum Board
            </StyledScrumBoardDetailTitle>
            &gt; Loading...
          </>
        }
      >
        <div style={{ padding: 24, textAlign: "center" }}>
          <p>Loading board data...</p>
        </div>
      </AppsContainer>
    );
  }

  // Kiểm tra xem board có tồn tại không
  const boardExists = boardDetail && boardDetail.id;

  if (!boardExists) {
    return (
      <AppsContainer
        fullView
        noContentAnimation
        title={
          <>
            <StyledScrumBoardDetailTitle onClick={onGoToBoardList}>
              Scrum Board
            </StyledScrumBoardDetailTitle>
            &gt; Board Not Found
          </>
        }
      >
        <div style={{ padding: 24, textAlign: "center" }}>
          <p>Board not found or failed to load.</p>
          <p>Board ID: {id}</p>
        </div>
      </AppsContainer>
    );
  }

  // Đảm bảo board có cấu trúc list (có thể là array rỗng)
  const boardWithLists = {
    ...boardDetail,
    list: boardDetail.list || [],
  };

  return (
    <AppsContainer
      fullView
      noContentAnimation
      title={
        <>
          <StyledScrumBoardDetailTitle onClick={onGoToBoardList}>
            Scrum Board
          </StyledScrumBoardDetailTitle>
          &gt; {boardDetail?.name}
        </>
      }
    >
      <BoardDetailTabs boardDetail={boardWithLists} setData={setData} />
    </AppsContainer>
  );
};

export default BoardDetail;
