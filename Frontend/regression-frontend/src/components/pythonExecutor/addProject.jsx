import React, { useState } from 'react';
import {
  Box,
  Button,
 
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { toast } from 'react-toastify';
import { useCreateScriptProjectMutation } from '../../services/python_scripts_service';

export default function AddScriptProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [ createScriptProject] = useCreateScriptProjectMutation();
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim()
    };

    try {
      const res = await createScriptProject(payload);
      if(res){
        toast.success("Project created successfully !")
      }
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save');
    }
  }

  return (
    <Box >
    
          <Typography variant="h5" sx={{ mb: 2 }}>Create Script Project</Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Project Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />

              {error && <Typography color="error">{error}</Typography>}

              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button type="submit" variant="contained">
                  { 'Create Project'}
                </Button>
              </Box>
            </Stack>
          </Box>
       
    </Box>
  );
}
