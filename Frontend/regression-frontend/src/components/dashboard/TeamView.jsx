import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Card,
  CardContent,
  Avatar,
  Grid,
  Stack,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useGetTeamMembersQuery } from "../../services/team";
import AddTeamMemberDialog from "./addTeamMember";

export default function TeamMembersPanel() {
  const { data, isLoading, isError, error } = useGetTeamMembersQuery({}, {refetchOnMountOrArgChange : true});
  const [open, setOpen] = useState(false);

  if (isLoading)
    return (
      <Box className="flex justify-center items-center p-10">
        <CircularProgress />
      </Box>
    );

  if (isError)
    return (
      <Alert severity="error" sx={{ mt : 4}}>
        { error?.data?.detail || "Failed to load team members. Please try again later."}
      </Alert>
    );

  const members = data?.members || [];

  return (
    <Box p={4}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            My Team Members
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Member
        </Button>
      </Stack>

      {/* Member Cards */}

      {data?.length ? (
        data?.map((team, index) => (
          <Box key={team.id || index}>
            {team?.team_name && (
              <Typography variant="body2" color="text.secondary">
                {team.team_name}
              </Typography>
            )}
            <Grid container spacing={2}>
              {team?.members.map((member, idx) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={member.id || idx}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      transition: "0.3s",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-3px)",
                      },
                      width: "100%",
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction={"row"}
                        spacing={2}
                        alignItems="center"
                        textAlign="center"
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 56,
                            height: 56,
                          }}
                        >
                          <PersonIcon fontSize="large" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {member.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.email || "No email"}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      ) : (
        <Grid item xs={12}>
          <Typography align="center" color="text.secondary">
            No team members found.
          </Typography>
        </Grid>
      )}

      <AddTeamMemberDialog
        open_state={open}
        handleClose={() => setOpen(false)}
      />
    </Box>
  );
}
