import styled from "styled-components";

export const StyledMessage = styled.p`
  width: fit-content;
  word-break: break-all;
  max-width: 90%;
  min-width: 30%;
  padding: 15px 15px 30px;
  border-radius: 8px;
  margin: 10px;
  position: relative;
`;

export const StyledSenderMessage = styled(StyledMessage)`
  margin-left: auto;
  background-color: #09397f;
  color: #fff;
`;

export const StyledReceiverMessage = styled(StyledMessage)`
  background-color: whitesmoke;
`;

export const StyledTimestamp = styled.span`
  color: gray;
  padding: 10px;
  font-size: x-small;
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
`;
