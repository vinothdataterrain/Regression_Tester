import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  CardActions,
  Divider
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlayArrow as TestIcon,
  CalendarToday as DateIcon,
  Description as DescriptionIcon
} from "@mui/icons-material";

export default function ProjectCard(project) {
  const navigate = useNavigate();
  const Project = project?.project;
  const testCaseCount = Project?.testcases?.length || 0;
  
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      flex: '1 1 auto'
    }}>
      <Card 
        sx={{ 
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: { xs: 'none', sm: 'translateY(-2px)', md: 'translateY(-4px)' },
            boxShadow: { 
              xs: '0 2px 8px rgba(0,0,0,0.1)', 
              sm: '0 4px 15px rgba(0,0,0,0.12)', 
              md: '0 8px 25px rgba(0,0,0,0.15)' 
            },
          },
          borderRadius: { xs: 1, sm: 1.5, md: 2 },
          border: '1px solid #e0e0e0',
          boxShadow: { xs: '0 1px 3px rgba(0,0,0,0.08)', sm: '0 2px 6px rgba(0,0,0,0.1)' }
        }}
      >
        <CardContent sx={{ 
          flexGrow: 1, 
          pb: { xs: 1, sm: 1.5 },
          px: { xs: 1.5, sm: 2 },
          pt: { xs: 1.5, sm: 2 },
          width: '100%',
          overflow: 'hidden'
        }}>
          {/* Project Name */}
          <Box sx={{ 
            width: '100%', 
            overflow: 'hidden',
            mb: { xs: 0.5, sm: 1 }
          }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                fontWeight: { xs: 600, sm: 600 },
                color: 'primary.main',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                width: '100%'
              }}
            >
              {Project?.name || 'Untitled Project'}
            </Typography>
          </Box>

          {/* Description */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            mb: { xs: 1.5, sm: 2 },
            minHeight: { xs: '2.5rem', sm: '3rem' },
            width: '100%',
            overflow: 'hidden'
          }}>
            <DescriptionIcon 
              sx={{ 
                color: 'text.secondary', 
                fontSize: { xs: 16, sm: 18 }, 
                mr: { xs: 0.5, sm: 1 }, 
                mt: 0.2,
                flexShrink: 0
              }} 
            />
            <Box sx={{ 
              flex: 1, 
              minWidth: 0, 
              overflow: 'hidden',
              width: '100%'
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 2, sm: 2, md: 2 },
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  wordBreak: 'break-word',
                  width: '100%'
                }}
              >
                {Project?.description || 'No description available'}
              </Typography>
            </Box>
          </Box>

          {/* Test Cases Count */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: { xs: 1.5, sm: 2 },
            flexWrap: 'wrap',
            gap: { xs: 0.5, sm: 1 }
          }}>
            <TestIcon 
              sx={{ 
                color: 'success.main', 
                fontSize: { xs: 16, sm: 18 }, 
                mr: { xs: 0.5, sm: 1 },
                flexShrink: 0
              }} 
            />
            <Chip
              label={`${testCaseCount} Test Case${testCaseCount !== 1 ? 's' : ''}`}
              size="small"
              color={testCaseCount > 0 ? 'success' : 'default'}
              variant={testCaseCount > 0 ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: 500,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 24, sm: 28 },
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.5 }
                }
              }}
            />
          </Box>

          {/* Created Date */}
          {Project?.created_at && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: { xs: 0.5, sm: 1 },
              flexWrap: 'wrap'
            }}>
              <DateIcon 
                sx={{ 
                  color: 'text.secondary', 
                  fontSize: { xs: 14, sm: 16 }, 
                  mr: { xs: 0.5, sm: 1 },
                  flexShrink: 0
                }} 
              />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Created: {new Date(Project.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </CardContent>

        <Divider sx={{ 
          mx: { xs: 1.5, sm: 2 },
          display: { xs: 'block', sm: 'block' }
        }} />

        <CardActions sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          pt: { xs: 1, sm: 1.5 },
          px: { xs: 1.5, sm: 2 }
        }}>
          <Button
            variant="contained"
            size="medium"
            fullWidth
            onClick={() => navigate(`/projects/${Project?.id}`)}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: { xs: 1, sm: 1.5 },
              py: { xs: 0.75, sm: 1 },
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' },
              minHeight: { xs: 36, sm: 40 }
            }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
