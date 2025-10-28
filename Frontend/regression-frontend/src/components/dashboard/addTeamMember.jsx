import React, { useState } from "react";

import { useAddTeamMemberMutation } from "../../services/team";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";

export default function AddTeamMemberDialog({open_state,handleClose}) {
  const [username, setUsername] = useState("");
  const [addMember, { isLoading, isSuccess, isError, error }] = useAddTeamMemberMutation();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      await addMember(username).unwrap();
      setUsername("");
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open_state} onClose={handleClose}>
        <form onSubmit={handleAdd}>
          <DialogTitle>Add Team Member</DialogTitle>

          <DialogContent>
            <DialogContentText>
              Enter the username of the member you want to add to your team.
            </DialogContentText>

            <TextField
              autoFocus
              margin="dense"
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error?.data?.detail || "Failed to add member."}
              </Alert>
            )}
            {isSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Member added successfully 🎉
              </Alert>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={18} />}
            >
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
  );
}
