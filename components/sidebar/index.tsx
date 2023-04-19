import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import MoreVerticalIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { DialogActions, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import * as EmailValidator from "email-validator";
import { signOut } from "firebase/auth";
import { addDoc, collection, query, where } from "firebase/firestore";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../../config/firebase";
import { IConversation } from "../../types";
import Conversation from "../conversation";
import {
  StyledContainer,
  StyledHeader,
  StyledSearch,
  StyledSearchInput,
  StyledSidebarButton,
  StyledUserAvatar,
} from "./styled";

const Sidebar = () => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const [isOpenNewConversationDialog, setIsOpenNewConversationDialog] =
    useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  const toggleNewConversationDialog = (isOpen: boolean) => {
    setIsOpenNewConversationDialog(isOpen);
    if (!isOpen) setRecipientEmail("");
  };

  const closeNewConversationDialog = () => {
    toggleNewConversationDialog(false);
  };

  // check if conversation already exists between the current logged in user and recipient
  const queryGetConversationsForCurrentUser = query(
    collection(db, "conversations"),
    where("users", "array-contains", loggedInUser?.email)
  );
  const [conversationsSnapshot, __loading, __error] = useCollection(
    queryGetConversationsForCurrentUser
  );

  const isConversationAlreadyExists = (recipientEmail: string) =>
    conversationsSnapshot?.docs.find((conversation) =>
      (conversation.data() as Conversation).users.includes(recipientEmail)
    );

  const createConversation = async () => {
    if (!recipientEmail) return;

    if (
      EmailValidator.validate(recipientEmail) &&
      recipientEmail !== loggedInUser?.email &&
      !isConversationAlreadyExists(recipientEmail)
    ) {
      // Add conversation user to db "conversations" collection
      // A conversation is between the currently logged in user and the user invited.

      await addDoc(collection(db, "conversations"), {
        users: [loggedInUser?.email, recipientEmail],
      });
    }

    closeNewConversationDialog();
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("ERROR LOGGING OUT", error);
    }
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <Tooltip title={loggedInUser?.email as string} placement="right">
          <StyledUserAvatar src={loggedInUser?.photoURL || ""} />
        </Tooltip>

        <div>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVerticalIcon />
          </IconButton>
          <IconButton onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </div>
      </StyledHeader>

      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput placeholder="Search in conversations" />
      </StyledSearch>

      <StyledSidebarButton
        onClick={() => {
          toggleNewConversationDialog(true);
        }}
      >
        Start a new conversation
      </StyledSidebarButton>

      {/* List of conversations */}
      {conversationsSnapshot?.docs.map((conversation) => (
        <Conversation
          key={conversation.id}
          id={conversation.id}
          participants={(conversation.data() as IConversation).users}
        />
      ))}

      <Dialog
        open={isOpenNewConversationDialog}
        onClose={closeNewConversationDialog}
      >
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a Google email address for the user you wish to chat
            with
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={recipientEmail}
            onChange={(event) => {
              setRecipientEmail(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewConversationDialog}>Cancel</Button>
          <Button disabled={!recipientEmail} onClick={createConversation}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default Sidebar;
