import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MicIcon from "@mui/icons-material/Mic";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import {
  KeyboardEventHandler,
  MouseEventHandler,
  useRef,
  useState,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../../config/firebase";
import { useRecipient } from "../../hooks/useRecipient";
import { IConversation, IMessage } from "../../types";
import {
  convertFirestoreTimestampToString,
  generateQueryGetMessages,
  transformMessage,
} from "../../utils/getMessagesInConversation";
import RecipientAvatar from "../user";
import Message from "../message";
import {
  EndOfMessagesForAutoScroll,
  StyledH3,
  StyledHeaderIcons,
  StyledHeaderInfo,
  StyledInput,
  StyledInputContainer,
  StyledMessageContainer,
  StyledRecipientHeader,
} from "./styled";

const Chat = ({
  conversation,
  messages,
}: {
  conversation: IConversation;
  messages: IMessage[];
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const conversationUsers = conversation.users;

  const { recipientEmail, recipient } = useRecipient(conversationUsers);

  const router = useRouter();
  const conversationId = router.query.id; // localhost:3000/conversations/:id

  const queryGetMessages = generateQueryGetMessages(conversationId as string);

  const [messagesSnapshot, messagesLoading, __error] =
    useCollection(queryGetMessages);

  const showMessages = () => {
    // If front-end is loading messages behind the scenes, display messages retrieved from Next SSR (passed down from [id].tsx)
    if (messagesLoading) {
      return messages.map((message) => (
        <Message key={message.id} message={message} />
      ));
    }

    // If front-end has finished loading messages, so now we have messagesSnapshot
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message key={message.id} message={transformMessage(message)} />
      ));
    }

    return null;
  };

  const addMessageToDbAndUpdateLastSeen = async () => {
    // update last seen in 'users' collection
    await setDoc(
      doc(db, "users", loggedInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    ); // just update what is changed

    // add new message to 'messages' collection
    await addDoc(collection(db, "messages"), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      owner: loggedInUser?.email,
    });

    // reset input field
    setNewMessage("");

    // scroll to bottom
    scrollToBottom();
  };

  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!newMessage) return;
      addMessageToDbAndUpdateLastSeen();
    }
  };

  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (!newMessage) return;
    addMessageToDbAndUpdateLastSeen();
  };

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <StyledRecipientHeader>
        <RecipientAvatar
          recipient={recipient}
          recipientEmail={recipientEmail}
        />

        <StyledHeaderInfo>
          <StyledH3>{recipientEmail}</StyledH3>
          {recipient && (
            <span>
              Last active:{" "}
              {convertFirestoreTimestampToString(recipient.lastSeen)}
            </span>
          )}
        </StyledHeaderInfo>

        <StyledHeaderIcons>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </StyledHeaderIcons>
      </StyledRecipientHeader>

      <StyledMessageContainer>
        {showMessages()}
        {/* for auto scroll to the end when a new message is sent */}
        <EndOfMessagesForAutoScroll ref={endOfMessagesRef} />
      </StyledMessageContainer>

      {/* Enter new message */}
      <StyledInputContainer>
        <InsertEmoticonIcon />
        <StyledInput
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={sendMessageOnEnter}
        />
        <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
          <SendIcon />
        </IconButton>
        <IconButton>
          <MicIcon />
        </IconButton>
      </StyledInputContainer>
    </>
  );
};

export default Chat;
