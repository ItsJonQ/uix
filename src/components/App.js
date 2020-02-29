import React, { useState, useEffect, useContext } from "react";
import styled from "@emotion/styled";

const AppContext = React.createContext({});
const useAppContext = () => useContext(AppContext);

function App() {
  return (
    <AppProvider>
      <HeaderBar />
    </AppProvider>
  );
}

function AppProvider({ children }) {
  const [isBig, setIsBig] = useState(false);

  const contextValue = {
    isBig,
    setIsBig
  };

  return (
    <AppContext.Provider value={contextValue}>
      <FrameContainerView>
        <FrameActionsView>
          <button onClick={() => setIsBig(!isBig)}>Toggle</button>
        </FrameActionsView>
        <FrameView>{children}</FrameView>
      </FrameContainerView>
    </AppContext.Provider>
  );
}

function HeaderBar() {
  const { isBig } = useAppContext();

  const heights = [50, 128];

  const style = {
    height: isBig ? heights[1] : heights[0],
    transition: `all 200ms ease`
  };

  const actionRightStyle = {
    opacity: isBig ? 1 : 0,
    transition: `all 200ms ease`
  };

  return (
    <HeaderView style={style}>
      <HeaderTitle isBig={isBig} />
      <Avatar isBig={isBig} />
      <HeaderActionLeftView>
        <ButtonView>Back</ButtonView>
      </HeaderActionLeftView>
      <HeaderActionRightView style={actionRightStyle}>
        <ButtonView>Edit</ButtonView>
      </HeaderActionRightView>
    </HeaderView>
  );
}

function Avatar({ isBig = false }) {
  const smallOffsetRight = 4;

  const sizes = [40, 64];
  const right = [sizes[0] / 2 + smallOffsetRight * 2, "50%"];
  const top = [4, 8];

  const style = {
    right: isBig ? right[1] : right[0],
    top: isBig ? top[1] : top[0],
    width: isBig ? sizes[1] : sizes[0],
    height: isBig ? sizes[1] : sizes[0],
    transform: `translateX(50%)`,
    transition: `all 200ms ease`
  };

  return (
    <AvatarWrapperView style={style}>
      <AvatarView />
    </AvatarWrapperView>
  );
}

function HeaderTitle({
  isBig = false,
  title = "User name",
  subtitle = "nickname"
}) {
  const top = [8, 80];
  const titleScale = [1, 1.2];

  const style = {
    top: isBig ? top[1] : top[0],
    transition: `all 200ms ease`
  };

  const titleStyle = {
    transform: isBig ? `scale(${titleScale[1]})` : `scale(${titleScale[0]})`,
    transition: `all 200ms ease`
  };

  return (
    <HeaderTitleWrapperView style={style}>
      <HeaderTitleView style={titleStyle}>{title}</HeaderTitleView>
      <HeaderSubtitleView>{subtitle}</HeaderSubtitleView>
    </HeaderTitleWrapperView>
  );
}

export function usePosition({ ref }) {
  const [position, setPosition] = useState({});

  useEffect(() => {
    const node = ref.current;
    if (node) {
      const bounds = node.getBoundingClientRect();
      setPosition(bounds);
    }
  }, [ref]);

  return position;
}

const FrameContainerView = styled.div`
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

const FrameActionsView = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px;
`;

const FrameView = styled.div`
  background: white;
  width: 100%;
  max-width: 360px;
  height: 100%;
  max-height: 640px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08), 0 12px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  user-select: none;
`;

const HeaderView = styled.div`
  background: white;
  height: 50px;
  border-bottom: 1px solid #eee;
  position: relative;
`;

const HeaderTitleWrapperView = styled.div`
  position: absolute;
  top: 8px;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
`;

const HeaderTitleView = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
`;

const HeaderSubtitleView = styled.div`
  font-size: 11px;
  opacity: 0.5;
`;

const AvatarView = styled.div`
  background: #aaa;
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const AvatarWrapperView = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
  z-index: 5;
`;

const HeaderActionLeftView = styled.div`
  position: absolute;
  top: 15px;
  left: 10px;
`;

const HeaderActionRightView = styled.div`
  position: absolute;
  top: 15px;
  right: 10px;
`;

const ButtonView = styled.button`
  appearance: none;
  color: blue;
  border: none;
  font-size: 14px;
  outline: none;
`;

export default App;
