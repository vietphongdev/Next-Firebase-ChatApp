import { useRouter } from "next/router";
import { useRecipient } from "../../hooks/useRecipient";
import { IConversation } from "../../types";
import RecipientAvatar from "../user";
import { StyledContainer } from "./styled";

const Conversation = ({
  id,
  participants,
}: {
  id: string;
  participants: IConversation["users"];
}) => {
  const { recipient, recipientEmail } = useRecipient(participants);

  const router = useRouter();

  const onSelectConversation = () => {
    router.push(`/conversations/${id}`);
  };

  return (
    <StyledContainer onClick={onSelectConversation}>
      <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail} />
      <span>{recipient?.name}</span>
    </StyledContainer>
  );
};

export default Conversation;
