import { collection, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../config/firebase";
import { AppUser, IConversation } from "../types";
import { getRecipientEmail } from "../utils/getRecipientEmail";

export const useRecipient = (participants: IConversation["users"]) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  // get recipient email
  const recipientEmail = getRecipientEmail(participants, loggedInUser);

  // get recipient avatar
  const recipientQuery = query(
    collection(db, "users"),
    where("email", "==", recipientEmail)
  );
  const [recipientsSnapshot, __loading, __error] =
    useCollection(recipientQuery);

  const recipient = recipientsSnapshot?.docs[0]?.data() as AppUser | undefined;

  return {
    recipient,
    recipientEmail,
  };
};
