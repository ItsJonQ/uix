import React, { useState, useEffect, useContext } from "react";
import {
  HashRouter as Router,
  useHistory,
  useRouteMatch
} from "react-router-dom";
import { noop } from "lodash";
import styled from "@emotion/styled";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

export const AppContext = React.createContext({});
export const useAppContext = () => useContext(AppContext);

function App() {
  return (
    <Router>
      <AppProvider>
        <FrameProvider>
          <HeaderBar />
        </FrameProvider>
      </AppProvider>
    </Router>
  );
}

function AppProvider({ children }) {
  const canDrag = useCanDrag();
  const [{ mx }, setDragMX] = useSpring(() => ({ mx: canDrag ? 1 : 0 }));

  useEffect(() => {
    setDragMX({
      mx: canDrag ? 1 : 0
    });
  }, [canDrag, setDragMX]);

  const contextValue = {
    mx,
    setDragMX
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

function FrameProvider({ children }) {
  const { setDragMX } = useAppContext();
  const navigateTo = useNavigateTo();
  const MAX = 360;
  const canDrag = useCanDrag();

  const bindGestures = useDrag(
    ({ down, movement, active }) => {
      const [mx] = movement;
      const navigateThreshold = MAX * 0.7;
      const didTriggerNavigate = mx > navigateThreshold;
      const resetValue = didTriggerNavigate ? 0 : 1;
      const nextMX = (MAX - mx) / MAX;

      if (!canDrag) return;
      if (mx < 0) return;

      if (!active) {
        if (didTriggerNavigate) {
          return navigateTo.home();
        }
      }

      setDragMX({
        mx: down ? nextMX : resetValue,
        immediate: down
      });
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
  const { mx } = useAppContext();
  const navigateTo = useNavigateTo();

  const heights = [50, 128];

  const style = {
    height: mx.interpolate([0, 1], heights)
  };

  const actionRightStyle = {
    opacity: mx
  };

  return (
    <HeaderView style={style}>
      <HeaderTitle onClick={navigateTo.details} />
      <Avatar onClick={navigateTo.details} />
      <HeaderActionLeftView>
        <ButtonView onClick={navigateTo.home}>Back</ButtonView>
      </HeaderActionLeftView>
      <HeaderActionRightView style={actionRightStyle}>
        <ButtonView>Edit</ButtonView>
      </HeaderActionRightView>
    </HeaderView>
  );
}

function Avatar({ onClick = noop }) {
  const { mx } = useAppContext();
  const MAX = 360;
  const RIGHT_CENTER = MAX / 2;
  const smallOffsetRight = 4;
  const sizes = [40, 64];
  const right = sizes[0] / 2 + smallOffsetRight * 2;
  const top = [4, 8];

  const rightRange = [right, RIGHT_CENTER];

  const style = {
    right: mx.interpolate([0, 1], rightRange),
    top: mx.interpolate([0, 1], top),
    transform: `translateX(50%)`,
    height: mx.interpolate([0, 1], sizes),
    width: mx.interpolate([0, 1], sizes)
  };

  return (
    <AvatarWrapperView style={style}>
      <AvatarView onClick={onClick} />
    </AvatarWrapperView>
  );
}

function HeaderTitle({
  title = "User name",
  subtitle = "nickname",
  onClick = noop
}) {
  const { mx } = useAppContext();

  const top = [8, 80];
  const titleScale = [1, 1.2];

  const style = {
    top: mx.interpolate([0, 1], top),
    marginBottom: mx.interpolate([0, 1], [0, 2])
  };

  const titleStyle = {
    scale: mx.interpolate([0, 1], titleScale)
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

function useCanDrag() {
  const isDetailsRoute = useRouteMatch("/details");

  return !!isDetailsRoute;
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

const HeaderView = styled(animated.div)`
  background: white;
  height: 50px;
  border-bottom: 1px solid #eee;
  position: relative;
`;

const HeaderTitleWrapperView = styled(animated.div)`
  position: absolute;
  top: 8px;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
`;

const HeaderTitleView = styled(animated.div)`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  cursor: pointer;
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
  cursor: pointer;
`;

const AvatarWrapperView = styled(animated.div)`
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

const HeaderActionRightView = styled(animated.div)`
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

export default App;
