import React, { useState, useEffect, useContext } from "react";
import {
  HashRouter as Router,
  useHistory,
  useRouteMatch
} from "react-router-dom";
import useMeasure from "react-use-measure";
import { noop } from "lodash";
import { css } from "@emotion/core";
import styled from "@emotion/styled";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import { ThemeProvider } from "emotion-theming";

const FRAME_WIDTH = 360;

export const AppContext = React.createContext({ frameWidth: FRAME_WIDTH });
export const useAppContext = () => useContext(AppContext);

function App() {
  return (
    <Router>
      <AppProvider>
        <FrameProvider>
          <HeaderBar />
          <DetailsScreen />
        </FrameProvider>
      </AppProvider>
    </Router>
  );
}

function AppProvider({ children }) {
  const canDrag = useCanDrag();

  const [{ mx }, setMX] = useSpring(() => ({
    mx: canDrag ? 1 : 0
  }));
  const [frameWidth, setFrameWidth] = useState(FRAME_WIDTH);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMX({
      mx: canDrag ? 1 : 0
    });
  }, [canDrag, setMX]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const contextValue = {
    mx,
    setMX,
    frameWidth,
    setFrameWidth,
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode
  };

  const theme = {
    background: isDarkMode ? "black" : "white",
    color: isDarkMode ? "white" : "black",
    borderColor: isDarkMode ? "#555" : "#ddd",
    transition:
      "background 200ms ease, border-color 200ms ease, color 200ms ease"
  };

  return (
    <AppContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppContext.Provider>
  );
}

function FrameProvider({ children }) {
  const { toggleDarkMode } = useAppContext();
  const navigateTo = useNavigateTo();
  const bindGestures = useScreenDragGestures({ onNavigate: navigateTo.home });

  return (
    <FrameContainerView>
      <FrameView {...bindGestures()}>
        {children}
        <FrameRef />
      </FrameView>
      <FrameActionsView>
        <h4 style={{ margin: "8px 0" }}>Chat: User Details UI Example</h4>
        <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
      </FrameActionsView>
    </FrameContainerView>
  );
}

function FrameRef() {
  const { setFrameWidth } = useAppContext();
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    setFrameWidth(bounds.width);
  }, [bounds.width, setFrameWidth]);

  return <FrameReferenceView ref={ref} />;
}

function HeaderBar() {
  const { mx } = useAppContext();
  const navigateTo = useNavigateTo();

  const style = {
    height: mx.to([0, 1], [50, 192])
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
      <HeaderActions />
    </HeaderView>
  );
}

function HeaderActions() {
  const { mx } = useAppContext();

  const style = {
    top: mx.to([0, 1], [8, 128]),
    opacity: mx,
    scale: mx
  };

  return (
    <ActionButtonContainerView style={style}>
      <HeaderAction label="Call" />
      <HeaderAction label="Mute" />
      <HeaderAction label="Search" />
      <HeaderAction label="More" />
    </ActionButtonContainerView>
  );
}

function HeaderAction({ label }) {
  const { mx } = useAppContext();

  const iconButtonWrapperStyle = {
    scale: mx
  };

  return (
    <IconButtonWrapperView style={iconButtonWrapperStyle}>
      <IconButtonView />
      <IconButtonLabel>{label}</IconButtonLabel>
    </IconButtonWrapperView>
  );
}

function Avatar({ onClick = noop }) {
  const { mx, frameWidth } = useAppContext();
  const RIGHT_CENTER = frameWidth / 2;
  const smallOffsetRight = 4;
  const sizes = [40, 64];
  const right = sizes[0] / 2 + smallOffsetRight * 2;
  const rightRange = [right, RIGHT_CENTER];

  const style = {
    right: mx.to([0, 1], rightRange),
    top: mx.to([0, 1], [4, 8]),
    transform: `translateX(50%)`,
    height: mx.to([0, 1], sizes),
    width: mx.to([0, 1], sizes)
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
  const titleScale = [1, 1.3];

  const style = {
    top: mx.to([0, 1], top),
    marginBottom: mx.to([0, 1], [0, 2])
  };

  const titleStyle = {
    scale: mx.to([0, 1], titleScale)
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

function DetailsScreen() {
  const { mx } = useAppContext();
  const style = {
    x: mx.to([0, 1], [360, 0])
  };
  const contentStyle = {
    opacity: mx
  };

  return (
    <ScreenView style={style}>
      <ScreenContentView style={contentStyle}>Details View</ScreenContentView>
    </ScreenView>
  );
}

function useScreenDragGestures({ onNavigate = noop }) {
  const { setMX, frameWidth } = useAppContext();
  const canDrag = useCanDrag();

  const bindGestures = useDrag(
    ({ down, movement, velocity, active }) => {
      const [mx] = movement;

      const isDraggingLeft = mx < 0;

      if (!canDrag) return;
      if (isDraggingLeft) return;

      const isHardSwipe = velocity > 2;
      const isStoppedDragging = !active;
      const navigateThreshold = frameWidth * 0.3;
      const didTriggerNavigate = mx > navigateThreshold;

      if (isStoppedDragging) {
        if (isHardSwipe) {
          return onNavigate();
        }

        if (didTriggerNavigate) {
          return onNavigate();
        }
      }

      const resetValue = didTriggerNavigate ? 0 : 1;
      const nextMX = (frameWidth - mx) / frameWidth;

      setMX({
        mx: down ? nextMX : resetValue,
        immediate: down
      });
    },
    {
      threshold: 36,
      bounds: {
        right: frameWidth
      }
    }
  );

  return bindGestures;
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

const backgroundStyles = ({ theme }) =>
  css({
    background: theme.background,
    transition: theme.transition
  });
const borderColorStyles = ({ theme }) =>
  css({
    borderColor: theme.borderColor,
    transition: theme.transition
  });
const colorStyles = ({ theme }) =>
  css({ color: theme.color, transition: theme.transition });

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
  top: 8px;
  left: 8px;
`;

const FrameView = styled.div`
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

const HeaderView = styled(animated.div)`
  height: 50px;
  border-bottom: 1px solid;
  position: relative;
  z-index: 1;
  ${backgroundStyles};
  ${borderColorStyles};
`;

const HeaderTitleWrapperView = styled(animated.div)`
  position: absolute;
  top: 8px;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
  ${colorStyles};
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
  background: transparent;
  color: dodgerblue;
  border: none;
  font-size: 14px;
  outline: none;
  cursor: pointer;
`;

const ScreenView = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ScreenContentView = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 208px 20px 20px;
  ${backgroundStyles};
  ${colorStyles};
`;

const ActionButtonContainerView = styled(animated.div)`
  position: absolute;
  top: 0;
  display: flex;
  justify-content: space-between;
  width: 75%;
  left: calc(25% / 2);
`;

const IconButtonWrapperView = styled(animated.div)`
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconButtonView = styled.div`
  background: dodgerblue;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const IconButtonLabel = styled.div`
  color: dodgerblue;
  margin-top: 4px;
  font-size: 11px;
  text-align: center;
`;

const FrameReferenceView = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  opacity: 0;
  pointer-events: none;
`;

export default App;
