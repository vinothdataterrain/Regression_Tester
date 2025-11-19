import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  useCreateGroupMutation,
  useEditGroupMutation,
} from "../../services/runTestCases.api.services";

export default function Group({
  open,
  currentProject,
  selectedModule,
  mode,
  onClose,
}) {
  const isAdding = mode === "add";
  const isEditing = mode === "edit";
  const [group, setGroup] = useState({
    name: "",
    description: "",
  });

  const [
    createGroup,
    {
      isSuccess: isGroupCreationSuccess,
      isError: isGroupCreationError,
      error: GroupCreationError,
      isLoading: isGroupCreationLoading,
    },
  ] = useCreateGroupMutation();

  const [
    editGroup,
    {
      isSuccess: isEditGroupSuccess,
      isError: isEditGroupError,
      isLoading: isEditGroupLoading,
      error: editGroupError,
    },
  ] = useEditGroupMutation();

  useEffect(() => {
    if (isEditing && selectedModule) {
      setGroup({
        name: selectedModule?.name,
        description: selectedModule?.description,
      });
    }
  }, [isEditing, selectedModule]);


  useEffect(() => {
    if (isGroupCreationSuccess) {
      toast.success("Module created successfully!");
    } else if (isGroupCreationError && GroupCreationError) {
      toast.error(GroupCreationError?.data || "Failed to create Module!");
    }
  }, [isGroupCreationSuccess, isGroupCreationError]);

  useEffect(() => {
    if (isEditGroupSuccess) {
      toast.success("Module updated successfully!");
    } else if (isEditGroupError && editGroupError) {
      toast.error(editGroupError?.data || "Failed to update Module!");
    }
  }, [isEditGroupSuccess, isEditGroupError]);

  const handleSubmit = async () => {
    if (!group.name.trim()) return;
    try {
      const groupData = {
        project: currentProject?.id,
        name: group.name,
        description: group.description,
      };
      if (isAdding) {
        await createGroup(groupData);
      }
      if (isEditing) {
        await editGroup({ id: selectedModule?.id, data: groupData });
      }
      setGroup({ name: "", description: "" });
      onClose();
    } catch (error) {
      console.error("Failed to create group: ", error);
    }
  };

  return (
    <Box>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon color="primary" />
            {isAdding ? "Add New Module" : "Update Module"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Module Title"
            multiline
            rows={1}
            fullWidth
            variant="outlined"
            value={group.name}
            onChange={(e) => setGroup({ ...group, name: e.target.value })}
            required
            placeholder="Enter Module Name"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Module Description"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={group.description}
            onChange={(e) =>
              setGroup({ ...group, description: e.target.value })
            }
            placeholder="Describe what this Module does and what you want to test..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isGroupCreationLoading}
            onClick={handleSubmit}
            startIcon={<AddIcon />}
          >
            {isAdding ? "Add Module" : "Update Module"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
