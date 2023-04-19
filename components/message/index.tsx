import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth } from "../../config/firebase";
import { IMessage } from "../../types";
import {
  StyledReceiverMessage,
  StyledSenderMessage,
  StyledTimestamp,
} from "./styled";

const Message = ({ message }: { message: IMessage }) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const MessageType =
    loggedInUser?.email === message.owner
      ? StyledSenderMessage
      : StyledReceiverMessage;

  return (
    <MessageType>
      {message.text}
      <StyledTimestamp>{message.sent_at}</StyledTimestamp>
    </MessageType>
  );
};

export default Message;
