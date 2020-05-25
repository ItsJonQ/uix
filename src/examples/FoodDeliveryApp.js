import React, { useEffect, useRef, useState } from "react";
import { css } from "@emotion/core";
import styled from "@emotion/styled";
import { useRadioState, Radio, RadioGroup } from "reakit/Radio";
import { FrameContainerView, FrameView } from "../components";
import { useScroll } from "react-use-gesture";
import { animated, useSpring, createInterpolator } from "react-spring";
import CoverImage from "../images/restaurant.jpg";

const SCROLL_MAX = 160;

const AppContext = React.createContext({});
const useAppContext = () => React.useContext(AppContext);

export function App() {
  return (
    <AppProvider>
      <FrameProvider>
        <ScreenProvider>
          <HeaderNavigation />
          <Cover />
          <Header />
          <Body />
        </ScreenProvider>
      </FrameProvider>
    </AppProvider>
  );
}

function AppProvider({ children }) {
  const [{ scrollY }, setScrollY] = useSpring(() => ({
    scrollY: 0
  }));

  const contextValue = {
    scrollY,
    setScrollY
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

function FrameProvider({ children }) {
  return (
    <FrameContainerView>
      <FrameView>{children}</FrameView>
    </FrameContainerView>
  );
}

function ScreenProvider({ children }) {
  const { setScrollY } = useAppContext();
  const bindScrollGestures = useScroll(({ offset }) => {
    const [, y] = offset;
    const interpolatedY = createInterpolator([0, 125], [0, 100])(y);
    const isWithinThreshold = interpolatedY <= SCROLL_MAX;

    setScrollY({
      scrollY: isWithinThreshold ? interpolatedY : SCROLL_MAX,
      immediate: true
    });
  });

  return <ScreenView {...bindScrollGestures()}>{children}</ScreenView>;
}

function HeaderNavigation() {
  const { scrollY } = useAppContext();
  const style = {
    color: scrollY.to(o => {
      return o > 140 ? "black" : "white";
    })
  };
  return (
    <BackIconWrapperView style={style}>
      <ArrowLeftIcon />
    </BackIconWrapperView>
  );
}

function Cover() {
  return (
    <CoverView>
      <img src={CoverImage} alt="Cover" />
    </CoverView>
  );
}

function Header() {
  const { scrollY } = useAppContext();
  const scrollTopPoint = 100;
  const scrollTopPointInputRange = [0, scrollTopPoint];

  const headerStyle = {
    height: scrollY.to(scrollTopPointInputRange, [156, 120])
  };
  const titleStyle = {
    fontSize: scrollY.to(scrollTopPointInputRange, [21, 18]),
    right: scrollY.to(scrollTopPointInputRange, [0, 25]),
    paddingRight: scrollY.to(scrollTopPointInputRange, [0, 100]).to(o => {
      return o > 50 ? 40 : null;
    }),
    paddingLeft: scrollY.to(scrollTopPointInputRange, [0, 20]),
    paddingTop: scrollY.to(scrollTopPointInputRange, [0, 3]),
    whiteSpace: scrollY.to(scrollTopPointInputRange, [0, 100]).to(o => {
      return o > 50 ? "nowrap" : null;
    })
  };

  const detailsStyle = {
    opacity: scrollY.to([scrollTopPoint / 2, scrollTopPoint], [1, 0]),
    pointerEvents: scrollY.to(o => {
      return o > 100 ? "none" : null;
    })
  };

  return (
    <HeaderView style={headerStyle}>
      <TitleView style={titleStyle}>
        The Famous Bird of Seoul (Spadina)
      </TitleView>
      <DetailsView style={detailsStyle}>
        <DetailTextView>Korean · Asian · $$</DetailTextView>
        <DetailTextView>
          20-30 Min - Delivery
          <br />
          $0.99 Delivery Fee
        </DetailTextView>
      </DetailsView>
      <NavigationMenu />
    </HeaderView>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function NavigationMenu() {
  const { scrollY } = useAppContext();
  const radio = useRadioState({ state: "order-again" });
  const menuNodeRef = useRef();
  const [transformXStyle, setTransformXStyle] = useSpring(() => ({ x: 0 }));

  const { currentId } = radio;

  useEffect(() => {
    const menuNode = menuNodeRef.current;
    if (!menuNode) return;

    const currentItemNode = menuNode.querySelector(`#${currentId}`);
    if (!currentItemNode) return;

    const { left: parentLeft } = menuNode.getBoundingClientRect();
    const { left } = currentItemNode.getBoundingClientRect();

    const offsetLeft = left - parentLeft;
    setTransformXStyle({ x: offsetLeft * -1 });
  }, [currentId, menuNodeRef, setTransformXStyle]);

  const wrapperScrollableStyle = {
    opacity: scrollY.to([100 * 0.9, 100], [0, 1])
  };

  const wrapperStyle = transformXStyle;

  const itemProps = {
    ...radio,
    onClick: event => {
      const id = event.target.id;
      radio.setCurrentId(id);
    }
  };

  const navMenuMarkup = (
    <RadioGroup {...radio} aria-label="My radios" ref={menuNodeRef}>
      <Radio {...itemProps} as={NavigationMenuItemView} value="order-again">
        Order Again
      </Radio>
      <Radio {...itemProps} as={NavigationMenuItemView} value="picked">
        Picked For You
      </Radio>
      <Radio {...itemProps} as={NavigationMenuItemView} value="appetizer">
        Appetizer
      </Radio>
    </RadioGroup>
  );

  const maskedMenuMarkup = (
    <div>
      <NavigationMenuItemView>Order Again</NavigationMenuItemView>
      <NavigationMenuItemView>Picked For You</NavigationMenuItemView>
      <NavigationMenuItemView>Appetizer</NavigationMenuItemView>
    </div>
  );

  return (
    <NavigationWrapperScrollableView style={wrapperScrollableStyle}>
      <NavigationWrapperView>
        <animated.div style={wrapperStyle}>{navMenuMarkup}</animated.div>
        <NavigationMenuBackdrop
          maskedMenu={maskedMenuMarkup}
          currentId={currentId}
          menuNodeRef={menuNodeRef}
        />
      </NavigationWrapperView>
    </NavigationWrapperScrollableView>
  );
}

function NavigationMenuBackdrop(props) {
  const { currentId, maskedMenu, menuNodeRef } = props;
  const [maskedStyle, setMaskedStyle] = useSpring(() => ({ width: 0, x: 0 }));
  const { width, x } = maskedStyle;

  useEffect(() => {
    const menuNode = menuNodeRef.current;
    if (!menuNode) return;

    const currentItemNode = menuNode.querySelector(`#${currentId}`);
    if (!currentItemNode) return;

    const { left: parentLeft } = menuNode.getBoundingClientRect();
    const { left, width: nextWidth } = currentItemNode.getBoundingClientRect();

    const offsetLeft = left - parentLeft;

    setMaskedStyle({ width: nextWidth, x: offsetLeft * -1 });
  }, [currentId, menuNodeRef, setMaskedStyle]);

  return (
    <NavigationMenuMaskedWrapperView style={{ width }}>
      <NavigationMenuMaskedInnerWrapperView
        style={{ transform: x.interpolate(o => `translateX(${o}px)`) }}
      >
        {maskedMenu}
      </NavigationMenuMaskedInnerWrapperView>
    </NavigationMenuMaskedWrapperView>
  );
}

function Body() {
  return <BodyView />;
}

const ScreenView = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  overflow-x: hidden;
`;

const CoverView = styled.div`
  width: 100%;
  height: 200px;
  position: relative;

  &::before {
    position: absolute;
    z-index: 1;
    content: "";
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    opacity: 0.6;
    background: rgb(0, 0, 0);
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 1) 100%
    );
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BackIconWrapperView = styled(animated.div)`
  position: sticky;
  color: black;
  top: 0;
  padding: 16px;
  margin-bottom: -60px;
  width: 60px;
  z-index: 10;
`;

const HeaderView = styled(animated.div)`
  position: sticky;
  top: 0;
  left: 0;
  background: white;
  padding: 16px;
  height: 160px;
  border-bottom: 1px solid #eee;
`;

const TitleView = styled(animated.div)`
  font-size: 21px;
  font-weight: 600;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 1;
`;

const DetailsView = styled(animated.div)`
  padding-top: 16px;
`;

const NavigationWrapperScrollableView = styled(animated.div)`
  position: absolute;
  bottom: 8px;
  left: 0px;
  padding: 0 0 8px 0;
  margin-left: 16px;
  overflow-y: auto;
  z-index: 20;
`;

const NavigationWrapperView = styled(animated.div)`
  white-space: nowrap;
`;

const DetailTextView = styled.div`
  opacity: 0.8;
  font-size: 13px;
  padding-bottom: 12px;

  &:last-child {
    padding-bottom: 0;
  }
`;

const BodyView = styled.div`
  height: 3000px;
`;

const NavigationMenuItemView = styled.button`
  appearance: none;
  border: none;
  background: none;
  padding: 8px 16px;
  color: black;
  font-size: 14px;
  line-height: 1;
  outline: none;
  cursor: pointer;
  transition: all 100ms linear;
  position: relative;
  z-index: 1;
`;

const NavigationMenuMaskedWrapperView = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  height: 30px;
  background: black;
  border-radius: 9999px;
  overflow: hidden;
  z-index: 1;

  button {
    color: white !important;
  }
`;

const NavigationMenuMaskedInnerWrapperView = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
`;

export default App;
