import React from "react";
import styled from "@emotion/styled";
import { FrameContainerView, FrameView, SkeletonView } from "../components";
import { useScroll } from "react-use-gesture";
import { animated, useSpring, to, createInterpolator } from "react-spring";
import AvatarImage from "../images/avatar.png";
import CoverImage from "../images/cover.jpg";

const SCROLL_MAX = 100;

const AppContext = React.createContext({});
const useAppContext = () => React.useContext(AppContext);

export function App() {
  const name = "Q";
  const handle = "@itsjonq";
  const count = "12.1K";

  return (
    <AppProvider>
      <FrameProvider>
        <ScreenProvider>
          <ProfileCover name={name} count={count} />
          <ProfileHeader name={name} handle={handle} />
          <BodyView>
            <Skeletons />
          </BodyView>
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

function ProfileCover({ name, count }) {
  const { scrollY } = useAppContext();

  const contentStyle = {
    y: scrollY.to([0, 40, 75, 100], [0, 0, -42, -68])
  };

  const imageStyle = {
    scale: scrollY.to([0, 20, 75, 100], [1, 1, 1.5, 1.5]),
    filter: scrollY
      .to([0, 20, 75, 100], [0, 0, 1.5, 10])
      .interpolate(v => `blur(${v}px)`),
    opacity: scrollY.to([0, 50, 100], [1, 1, 0.8])
  };

  return (
    <ProfileCoverView>
      <CoverContentView style={contentStyle}>
        <CoverNameView>{name}</CoverNameView>
        <CoverCountView>{count} Bloops</CoverCountView>
      </CoverContentView>
      <ProfileCoverImageView style={imageStyle}>
        <ImageView src={CoverImage} />
      </ProfileCoverImageView>
    </ProfileCoverView>
  );
}

function ProfileHeader({ name, handle }) {
  const { scrollY } = useAppContext();

  const avatarStyle = {
    scale: scrollY.to([0, 35, 100], [1, 0.45, 0.45]),
    zIndex: to([scrollY], y => {
      if (y > 35) return 0;
      return 11;
    }),
    transformOrigin: "bottom center"
  };

  return (
    <ProfileHeaderView>
      <AvatarWrapperView style={avatarStyle}>
        <AvatarView>
          <ImageView src={AvatarImage} />
        </AvatarView>
      </AvatarWrapperView>
      <ProfileNameView>{name}</ProfileNameView>
      <ProfileHandleView>{handle}</ProfileHandleView>
    </ProfileHeaderView>
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

const ScreenView = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
`;

const ProfileCoverView = styled.div`
  height: 100px;
  width: 100%;
  background-color: black;
  position: sticky;
  top: -50px;
  left: 0;
  z-index: 10;
  overflow: hidden;
`;

const ProfileCoverImageView = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ImageView = styled.img`
  display: block;
  object-fit: cover;
  width: 100%;
  height: 100%;
`;

const AvatarWrapperView = styled(animated.div)`
  position: relative;
  z-index: 1;
  width: 50px;
  height: 50px;
  margin-top: -42px;
`;

const AvatarView = styled(animated.div)`
  background: white;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
`;

const ProfileHeaderView = styled.div`
  padding: 16px 16px 0;
`;

const ProfileNameView = styled.div`
  font-size: 16px;
  font-weight: 900;
  margin: 4px 0;
`;

const ProfileHandleView = styled.div`
  opacity: 0.5;
  font-size: 12px;
`;

const CoverContentView = styled(animated.div)`
  color: white;
  text-align: center;
  position: absolute;
  top: 128px;
  left: 0;
  right: 0;
  z-index: 1;
`;

const CoverNameView = styled.div`
  font-size: 14px;
  font-weight: 900;
`;

const CoverCountView = styled.div`
  font-size: 11px;
`;

const BodyView = styled.div`
  padding: 16px;
`;

export default App;
