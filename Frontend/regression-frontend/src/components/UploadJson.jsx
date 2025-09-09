import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { UploadFile } from "@mui/icons-material";

const UploadTestCase = ({ project, createTestCase }) => {
  const [open, setOpen] = useState(false);
  const [testCaseName, setTestCaseName] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTestCaseName("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!testCaseName.trim()) {
      alert("Please enter a test case name first!");
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const PlaywrightFormat = convertToPlaywrightFormat(jsonData);

      const payloadData = {
        project: project.id,
        name: testCaseName,
        steps: PlaywrightFormat
      };

      try {
        await createTestCase(payloadData).unwrap();
        console.log("Playwright payload successfully sent:", PlaywrightFormat);
        handleClose();
      } catch (apiErr) {
        console.error("API error while creating test case:", apiErr);
        alert("Failed to create test case. Please check your data or network.");
      }
    } catch (err) {
      console.error("Failed to read or parse JSON file:", err);
      alert("Invalid JSON file. Please upload a valid JSON file.");
    }
  };

  return (
    <>
      <Button
        variant="contained"
        sx={{ mx: 2 }}
        onClick={handleOpen}
        size="small"
      >
        <UploadFile />
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Test Case JSON</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Test Case Name"
            type="text"
            fullWidth
            value={testCaseName}
            onChange={(e) => setTestCaseName(e.target.value)}
          />
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            Select JSON File
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadTestCase;
