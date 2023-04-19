import { User } from "firebase/auth";
import { IConversation } from "../types";

export const getRecipientEmail = (
  participants: IConversation["users"],
  loggedInUser?: User | null
) => participants.find((userEmail) => userEmail !== loggedInUser?.email);
