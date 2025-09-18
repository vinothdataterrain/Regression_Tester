import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const AddScriptDialog = ({ open, handleClose, projectId, onSubmit }) => {
  const [scriptName, setScriptName] = useState("");
  const [scriptContent, setScriptContent] = useState("");

  const handleSubmit = () => {
    if (!scriptName || !scriptContent) return;

    // Pass back to parent
    onSubmit({
      name: scriptName,
      script: scriptContent,
    });

    // Reset + close
    setScriptName("");
    setScriptContent("");
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Add Python Script - {projectId?.name}</DialogTitle>
      <DialogContent dividers>
        {/* Script Name */}
        <TextField
          label="Script Name"
          fullWidth
          margin="normal"
          value={scriptName}
          onChange={(e) => setScriptName(e.target.value)}
        />

        {/* Script Content */}
        <TextField
          label="Python Script"
          fullWidth
          multiline
          rows={12}
          margin="normal"
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          placeholder="# Write your Python script here..."
          InputProps={{
            sx: { fontFamily: "monospace", fontSize: "0.9rem" },
          }}
        />
      </DialogContent>

      <DialogActions className="items-center justify-center flex">
        <Button onClick={handleClose} color="primary" variant="outlined" className="w-[150px]">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
           className="w-[150px]"
        >
          Save Script
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddScriptDialog;
