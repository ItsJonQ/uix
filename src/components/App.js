import React, { useState, useEffect, useContext } from "react";
import {
  HashRouter as Router,
  useHistory,
  useRouteMatch
} from "react-router-dom";
import { noop } from "lodash";
import styled from "@emotion/styled";
import { useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

export const AppContext = React.createContext({});
export const useAppContext = () => useContext(AppContext);

function App() {
  return (
    <AppProvider>
      <FrameProvider>
        <HeaderBar />
      </FrameProvider>
    </AppProvider>
  );
}

function AppProvider({ children }) {
  const [{ x, mx }, setDragX] = useSpring(() => ({ x: 0, mx: 0 }));

  const contextValue = {
    dragX: x,
    dragMX: mx,
    setDragX
  };

  return (
    <Router>
      <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
    </Router>
  );
}

function FrameProvider({ children }) {
  const { setDragX } = useAppContext();
  const MAX = 360;
  const bindGestures = useDrag(
    ({ down, event, movement, cancel }) => {
      const [mx] = movement;
      if (mx > 0) {
        setDragX({
          x: down ? mx : 0,
          mx: down ? ((MAX + mx) / MAX - 1) * 100 : 0,
          immediate: down
        });
      }
    },
    {
      bounds: {
        right: MAX
      }
    }
  );

  return (
    <FrameContainerView>
      <FrameView {...bindGestures()}>{children}</FrameView>
    </FrameContainerView>
  );
}

function HeaderBar() {
  const navigateTo = useNavigateTo();
  const isBig = !!useRouteMatch("/details");

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
      <HeaderTitle isBig={isBig} onClick={navigateTo.details} />
      <Avatar isBig={isBig} onClick={navigateTo.details} />
      <HeaderActionLeftView>
        <ButtonView onClick={navigateTo.home}>Back</ButtonView>
      </HeaderActionLeftView>
      <HeaderActionRightView style={actionRightStyle}>
        <ButtonView>Edit</ButtonView>
      </HeaderActionRightView>
    </HeaderView>
  );
}

function Avatar({ isBig = false, onClick = noop }) {
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
      <AvatarView onClick={onClick} />
    </AvatarWrapperView>
  );
}

function HeaderTitle({
  isBig = false,
  title = "User name",
  subtitle = "nickname",
  onClick = noop
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
      <HeaderTitleView style={titleStyle} onClick={onClick}>
        {title}
      </HeaderTitleView>
      <HeaderSubtitleView>{subtitle}</HeaderSubtitleView>
    </HeaderTitleWrapperView>
  );
}

function useNavigateTo() {
  const history = useHistory();

  return {
    home: () => history.push("/"),
    details: () => history.push("/details")
  };
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
  cursor: pointer;
`;

// function normalize(val, max, min) {
//   return (val - min) / (max - min);
// }

export default App;
