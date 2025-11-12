import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Link,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  ShoppingCart as BuyIcon,
} from '@mui/icons-material';
import { moviesAPI } from '../services/api';

const WatchOptions = ({ movieId, compact = false }) => {
  const [watchOptions, setWatchOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWatchOptions = async () => {
      try {
        setLoading(true);
        const response = await moviesAPI.getWatchOptions(movieId);
        setWatchOptions(response.data.watch_options || []);
      } catch (err) {
        console.error('Error fetching watch options:', err);
        setError('Unable to load watch options');
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchWatchOptions();
    }
  }, [movieId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error || !watchOptions.length) {
    return null;
  }

  if (compact) {
    // Compact view for MovieCard - show first 4 platforms
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Watch on:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {watchOptions.slice(0, 4).map((option, index) => (
            <Tooltip key={index} title={`${option.platform} - ${option.type}`} arrow>
              <Chip
                component={Link}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                label={option.platform}
                size="small"
                icon={option.type === 'subscription' ? <PlayIcon /> : <BuyIcon />}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s',
                  },
                }}
              />
            </Tooltip>
          ))}
          {watchOptions.length > 4 && (
            <Chip
              label={`+${watchOptions.length - 4} more`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>
    );
  }

  // Full view for MovieDetail page
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PlayIcon /> Where to Watch
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        {watchOptions.map((option, index) => (
          <Tooltip key={index} title={`Click to search on ${option.platform}`} arrow>
            <Box
              component={Link}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                textDecoration: 'none',
                minWidth: 120,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                  bgcolor: 'rgba(255, 69, 105, 0.05)',
                },
              }}
            >
              <Avatar
                src={option.logo}
                alt={option.platform}
                sx={{ width: 48, height: 48, bgcolor: 'background.paper' }}
              >
                {option.platform[0]}
              </Avatar>
              <Typography variant="body2" fontWeight={600} textAlign="center">
                {option.platform}
              </Typography>
              <Chip
                label={option.type}
                size="small"
                color={option.type === 'subscription' ? 'primary' : 'secondary'}
                sx={{ textTransform: 'capitalize' }}
              />
              {option.price && (
                <Typography variant="caption" color="text.secondary">
                  {option.price}
                </Typography>
              )}
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        * Availability may vary by region. Click to check current availability.
      </Typography>
    </Box>
  );
};

export default WatchOptions;
