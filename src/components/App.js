import React, { useState, useEffect, useContext, useRef } from "react";
import {
  HashRouter as Router,
  useHistory,
  useRouteMatch
} from "react-router-dom";
import useMeasure from "react-use-measure";
import { noop } from "lodash";
import { css } from "@emotion/core";
import styled from "@emotion/styled";
import { useSpring, animated, to, createInterpolator } from "react-spring";
import { useDrag, useScroll } from "react-use-gesture";
import { ThemeProvider } from "emotion-theming";

const FRAME_WIDTH = 360;
const DETAILS_HEADER_HEIGHTS_BP = [138, 154, 188];
const DETAILS_HEADER_HEIGHTS = [
  DETAILS_HEADER_HEIGHTS_BP[0],
  DETAILS_HEADER_HEIGHTS_BP[2]
];
const DETAILS_HEADER_HEIGHT = DETAILS_HEADER_HEIGHTS[1];

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
  const [{ headerHeight }, setHeaderHeight] = useSpring(() => ({
    headerHeight: DETAILS_HEADER_HEIGHT
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
    toggleDarkMode,
    headerHeight,
    setHeaderHeight
  };

  const theme = {
    background: isDarkMode ? "black" : "white",
    color: isDarkMode ? "white" : "black",
    borderColor: isDarkMode ? "#555" : "#ddd",
    transition:
      "background 200ms ease, border-color 200ms ease, color 200ms ease",
    skeletonBackground: isDarkMode ? "#333" : "#ddd"
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
  const { mx, headerHeight } = useAppContext();
  const navigateTo = useNavigateTo();

  const style = {
    height: to([mx, headerHeight], (m, h) => {
      const mxValue = createInterpolator([0, 1], [50, 192])(m);
      const headerValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [50, 192])(
        h
      );
      const headerTestValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0,
        1
      ])(h);

      if (m !== 1) {
        return mxValue;
      }

      if (headerTestValue < 1) {
        return headerValue;
      }

      return mxValue;
    })
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
  const { mx, headerHeight } = useAppContext();

  const style = {
    top: to([mx, headerHeight], (m, h) => {
      const mxValue = createInterpolator([0, 1], [8, 128])(m);
      const headerValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [0, 128])(
        h
      );
      const headerTestValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0,
        1
      ])(h);

      if (m !== 1) {
        return mxValue;
      }

      if (headerTestValue < 1) {
        return headerValue;
      }

      return mxValue;
    }),
    opacity: to([mx, headerHeight], (m, h) => {
      const mxValue = m;
      const headerValue = createInterpolator(DETAILS_HEADER_HEIGHTS_BP, [
        0,
        1,
        1
      ])(h);
      const headerTestValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0,
        1
      ])(m);

      if (m !== 1) {
        return mxValue;
      }

      if (headerTestValue < 1 && mxValue === 1) {
        return headerValue;
      }

      return mxValue;
    }),
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
  const { mx, headerHeight } = useAppContext();

  const iconButtonWrapperStyle = {
    scale: to([mx, headerHeight], (m, h) => {
      const mxValue = m;
      const headerValue = createInterpolator(DETAILS_HEADER_HEIGHTS_BP, [
        0,
        1,
        1
      ])(h);
      const headerTestValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0,
        1
      ])(h);

      if (m !== 1) {
        return mxValue;
      }

      if (headerTestValue < 1) {
        return headerValue;
      }

      return m;
    })
  };

  return (
    <IconButtonWrapperView style={iconButtonWrapperStyle}>
      <IconButtonView />
      <IconButtonLabel>{label}</IconButtonLabel>
    </IconButtonWrapperView>
  );
}

function Avatar({ onClick = noop }) {
  const { mx, headerHeight, frameWidth } = useAppContext();
  const RIGHT_CENTER = frameWidth / 2;
  const smallOffsetRight = 4;
  const sizes = [40, 64];
  const right = sizes[0] / 2 + smallOffsetRight * 2;
  const rightRange = [right, RIGHT_CENTER];

  const style = {
    right: mx.to([0, 1], rightRange),
    top: to([mx, headerHeight], (m, h) => {
      const mxValue = createInterpolator([0, 1], [4, 8])(m);
      const headerTopValue = createInterpolator(DETAILS_HEADER_HEIGHTS_BP, [
        -58,
        -58,
        8
      ])(h);
      const headerTestValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0,
        1
      ])(h);

      if (m !== 1) {
        return mxValue;
      }

      if (headerTestValue < 1) {
        return headerTopValue;
      }

      return mxValue;
    }),
    marginRight: mx.to([0, 1], [(sizes[0] / 2) * -1, (sizes[1] / 2) * -1]),
    height: mx.to([0, 1], sizes),
    width: mx.to([0, 1], sizes),
    scale: to([headerHeight], h => {
      const headerTopValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0.5,
        1
      ])(h);
      const headerTestValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0,
        1
      ])(h);

      if (headerTestValue < 1) {
        return headerTopValue;
      }

      return 1;
    })
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
  const { mx, headerHeight } = useAppContext();

  const style = {
    top: to([mx, headerHeight], (m, h) => {
      const mxValue = createInterpolator([0, 1], [8, 80])(m);
      const headerValue = createInterpolator(DETAILS_HEADER_HEIGHTS_BP, [
        8,
        8,
        80
      ])(h);
      const headerTestValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0,
        1
      ])(h);

      if (m !== 1) {
        return mxValue;
      }

      if (headerTestValue < 1) {
        return headerValue;
      }
      return mxValue;
    }),
    marginBottom: mx.to([0, 1], [0, 2])
  };

  const titleStyle = {
    scale: to([mx, headerHeight], (m, h) => {
      const mxValue = createInterpolator([0, 1], [1, 1.3])(m);
      const headerValue = createInterpolator(DETAILS_HEADER_HEIGHTS_BP, [
        1,
        1,
        1.3
      ])(h);
      const headerTestValue = createInterpolator(DETAILS_HEADER_HEIGHTS, [
        0,
        1
      ])(h);

      if (m !== 1) {
        return mxValue;
      }

      if (headerTestValue < 1) {
        return headerValue;
      }
      return mxValue;
    })
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
  const canDrag = useCanDrag();
  const scrollContainerRef = useRef();
  const { mx, headerHeight, setHeaderHeight } = useAppContext();
  const initialHeight = DETAILS_HEADER_HEIGHTS[1];

  useEffect(() => {
    if (canDrag && scrollContainerRef.current) {
      const node = scrollContainerRef.current.children[0];
      console.log(node);
      node.scrollTop = 0;
    }
  }, [canDrag]);

  const bindScrollGestures = useScroll(
    ({ event, offset }) => {
      const [, y] = offset;
      const maxScrollThreshold = 50;

      if (!canDrag) {
        return setHeaderHeight({
          headerHeight: initialHeight,
          immediate: true
        });
      }

      if (y === 0) {
        return setHeaderHeight({
          headerHeight: initialHeight,
          immediate: true
        });
      }

      if (y < maxScrollThreshold) {
        return setHeaderHeight({
          headerHeight: initialHeight - y,
          immediate: true
        });
      }
      return setHeaderHeight({
        headerHeight: DETAILS_HEADER_HEIGHTS[0],
        immediate: true
      });
    },
    {
      eventOptions: { passive: false }
    }
  );

  const style = {
    x: mx.to([0, 1], [360, 0])
  };

  const contentStyle = {
    opacity: mx
  };

  const placeholderStyle = {
    height: headerHeight.to(DETAILS_HEADER_HEIGHTS, [108, 188])
  };

  return (
    <ScreenView style={style} ref={scrollContainerRef}>
      <ScreenContentView style={contentStyle} {...bindScrollGestures()}>
        <ScreenHeaderPlaceholderView style={placeholderStyle} />
        <Skeletons />
      </ScreenContentView>
    </ScreenView>
  );
}

function Skeletons() {
  return (
    <>
      <SkeletonView style={{ height: 120 }} />
      <SkeletonView />
      <SkeletonView />
      <SkeletonView style={{ height: 200 }} />
      <SkeletonView />
      <SkeletonView />
      <SkeletonView />
      <SkeletonView style={{ height: 120 }} />
      <SkeletonView style={{ height: 120 }} />
    </>
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

const ScreenHeaderPlaceholderView = styled(animated.div)`
  height: 188px;
`;

const ScreenContentView = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px;
  overflow-y: auto;
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

const SkeletonView = styled.div`
  padding: 10px;
  margin-bottom: 12px;
  ${({ theme }) => css({ background: theme.skeletonBackground })};
`;

export default App;
