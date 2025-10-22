import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";

import {
  StyledSCrumBoardAddBtnCard,
  StyledScrumBoardAddBtnCardText,
  StyledScrumBoardAddCardBtnUser,
  StyledScrumBoardAddCardUserAvatar,
  StyledScrumBoardMdAdd,
} from "./index.styled";

type AddCardButtonProps = {
  laneId?: number;
  t?: (laneId: number) => void;
  onClickAddCard?: (listId: number) => void;
};

const AddCardButton: React.FC<AddCardButtonProps> = (props) => {
  const handleClick = () => {
    // Use the callback function passed from react-trello or our custom one
    if (props.t && props.laneId !== undefined) {
      props.t(props.laneId);
    } else if (props.onClickAddCard && props.laneId !== undefined) {
      props.onClickAddCard(props.laneId);
    }
  };

  return (
    <StyledSCrumBoardAddBtnCard onClick={handleClick}>
      <StyledScrumBoardAddCardBtnUser>
        <StyledScrumBoardAddCardUserAvatar>
          <StyledScrumBoardMdAdd />
        </StyledScrumBoardAddCardUserAvatar>
        <StyledScrumBoardAddBtnCardText>
          <IntlMessages id="scrumboard.addACard" />
        </StyledScrumBoardAddBtnCardText>
      </StyledScrumBoardAddCardBtnUser>
    </StyledSCrumBoardAddBtnCard>
  );
};

export default AddCardButton;
