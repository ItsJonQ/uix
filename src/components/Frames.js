import { css } from "@emotion/core";
import styled from "@emotion/styled";

export const FRAME_WIDTH = 360;

const backgroundStyles = ({ theme = {} }) =>
  css({
    background: theme.background || "white",
    transition: theme.transition
  });

export const FrameContainerView = styled.div`
  align-items: center;
  background-color: #ddd;
  display: flex;
  height: 100vh;
  justify-content: center;
  position: relative;
  width: 100%;
  padding: 16px;
  flex-direction: column;
`;

export const FrameActionsView = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
`;

export const FrameView = styled.div`
  width: 100%;
  max-width: 360px;
  height: 100%;
  max-height: 640px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08), 0 12px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  user-select: none;
  position: relative;
  ${backgroundStyles};
`;
