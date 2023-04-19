import { doc, getDoc, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useAuthState } from "react-firebase-hooks/auth";
import Chat from "../../components/chat";
import Sidebar from "../../components/sidebar";
import { auth, db } from "../../config/firebase";
import { IConversation, IMessage } from "../../types";
import {
  generateQueryGetMessages,
  transformMessage,
} from "../../utils/getMessagesInConversation";
import { getRecipientEmail } from "../../utils/getRecipientEmail";
import { StyledContainer, StyledConversationContainer } from "./styled";

interface Props {
  conversation: IConversation;
  messages: IMessage[];
}

const Conversation = ({ conversation, messages }: Props) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  return (
    <StyledContainer>
      <Head>
        <title>Chat</title>
      </Head>

      <Sidebar />

      <StyledConversationContainer>
        <Chat conversation={conversation} messages={messages} />
      </StyledConversationContainer>
    </StyledContainer>
  );
};

export default Conversation;

export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async (context) => {
  const conversationId = context.params?.id;

  // get conversation, to know who we are chatting with
  const conversationRef = doc(db, "conversations", conversationId as string);

  const conversationSnapshot = await getDoc(conversationRef);

  // get all messages between logged in user and recipient in this conversation
  const queryMessages = generateQueryGetMessages(conversationId);

  const messagesSnapshot = await getDocs(queryMessages);

  const messages = messagesSnapshot.docs.map((messageDoc) =>
    transformMessage(messageDoc)
  );

  return {
    props: {
      conversation: conversationSnapshot.data() as IConversation,
      messages,
    },
  };
};
