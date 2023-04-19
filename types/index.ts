import { Timestamp } from "firebase/firestore";

export interface IConversation {
  users: string[];
}

export interface AppUser {
  email: string;
  lastSeen: Timestamp;
  photoURL: string;
  name: string;
}

export interface IMessage {
  id: string;
  conversation_id: string;
  text: string;
  sent_at: string;
  owner: string;
}
