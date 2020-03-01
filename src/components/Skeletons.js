import { css } from "@emotion/core";
import styled from "@emotion/styled";

export const SkeletonView = styled.div`
  padding: 10px;
  margin-bottom: 12px;
  ${({ theme }) => css({ background: theme.skeletonBackground || "#eee" })};
`;
