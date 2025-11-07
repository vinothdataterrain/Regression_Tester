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
import { useCreateGroupMutation } from "../../services/runTestCases.api.services";

export default function Group({ currentProject }) {
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
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

  useEffect(() => {
    if (isGroupCreationSuccess) {
      toast.success("Group created successfully!");
    } else if (isGroupCreationError && GroupCreationError) {
      toast.error(GroupCreationError?.data || "Failed to create Group!");
    }
  }, [isGroupCreationSuccess, isGroupCreationError]);

  const AddGroup = async () => {
    if (!group.name.trim() || !group.description.trim()) return;
    try {
      const groupData = {
        project : currentProject?.id,
        name: group.name,
        description: group.description,
      };
      await createGroup(groupData);
      setGroup({ name: "", description: "" });
      setIsAddingGroup(false);
    } catch (error) {
      console.error("Failed to create group: ", error);
    }
  };

  const EditGroup = () => {};

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          setIsAddingGroup(true);
        }}
        size="small"
        className="!min-w-[120px] !bg-blue-700"
      >
        {"Add Group"}
      </Button>
      <Dialog
        open={isAddingGroup || isEditingGroup}
        onClose={() => {
          setIsAddingGroup(false);
          setIsEditingGroup(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon color="primary" />
            {isAddingGroup ? "Add New Group" : "Update Group"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Group Title"
            multiline
            rows={1}
            fullWidth
            variant="outlined"
            value={group.name}
            onChange={(e) => setGroup({...group, name : e.target.value})}
            required
            placeholder="Enter Group Name"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Group Description"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={group.description}
            onChange={(e) => setGroup({...group, description : e.target.value})}
            placeholder="Describe what this Group does and what you want to test..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setIsAddingGroup(false);
              setIsEditingGroup(false);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isGroupCreationLoading}
            onClick={() => {
              if (isAddingGroup) {
                AddGroup();
              } else if (isEditingGroup) {
                EditGroup();
              }
            }}
            startIcon={<AddIcon />}
          >
            {isAddingGroup ? "Add Group" : "Update Group"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
