import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAddTeamMemberMutation, useGetUserTeamsQuery } from "../../services/team";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { SelectBox } from "../common/selectBox";

export default function AddTeamMemberDialog({open_state,handleClose}) {
  const [username, setUsername] = useState("");
  const [teamId, setTeamId] = useState("");
  const {data: team} = useGetUserTeamsQuery();
  const [addMember, { isLoading, isSuccess, isError, error }] = useAddTeamMemberMutation();
  const [list, setList] = useState([])

  useEffect(() => {
    if(isSuccess){
      toast.success("Member added successfully!")
    }
    else if(isError && error){
      toast.error(error?.data?.detail || "Failed to add member")
    }
  },[isSuccess, isError])
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      const data = {
        username : username,
        team_id : teamId,
      }
      await addMember(data).unwrap();
      setUsername("");
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (e) => {
   setTeamId(e.target.value)
  }

  useEffect(() => {
  if(team){

    const lst = team?.map((e) => ({label : e.name, value : e.id}))
    setList(lst)
  }
  },[team])
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
            <SelectBox
            value={teamId}
            placeholder="Select Team"
            menuList={list}
            handleChange={handleSelect}
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
            <Button onClick={() => {setUsername(""); setTeamId(""); handleClose()}} color="secondary">
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
