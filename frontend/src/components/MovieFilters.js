import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Badge,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  Schedule as LatestIcon,
  Movie as AllIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

const MovieFilters = ({ 
  currentFilter, 
  currentSearch, 
  categories, 
  onFilterChange, 
  onSearchChange 
}) => {
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange(searchInput.trim());
  };

  const handleSearchClear = () => {
    setSearchInput('');
    onSearchChange('');
  };

  const filterTabs = [
    {
      value: 'all',
      label: 'All Movies',
      icon: <AllIcon />,
      count: categories.all,
      color: 'default',
    },
    {
      value: 'trending',
      label: 'Trending',
      icon: <TrendingIcon />,
      count: categories.trending,
      color: 'primary',
    },
    {
      value: 'top-rated',
      label: 'Top Rated',
      icon: <StarIcon />,
      count: categories['top-rated'],
      color: 'secondary',
    },
    {
      value: 'latest',
      label: 'Latest',
      icon: <LatestIcon />,
      count: categories.latest,
      color: 'success',
    },
  ];

  const TabComponent = ({ tab, isActive, onClick }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        bgcolor: isActive ? 'primary.main' : 'transparent',
        color: isActive ? 'primary.contrastText' : 'text.primary',
        '&:hover': {
          bgcolor: isActive ? 'primary.dark' : 'action.hover',
        },
        border: `1px solid ${isActive ? 'transparent' : theme.palette.divider}`,
      }}
    >
      {tab.icon}
      <Typography variant="body2" fontWeight={isActive ? 600 : 400}>
        {tab.label}
      </Typography>
      {tab.count > 0 && (
        <Chip 
          label={tab.count} 
          size="small" 
          sx={{ 
            height: 20,
            minWidth: 20,
            '& .MuiChip-label': { px: 0.5, fontSize: '0.75rem' },
            bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'action.selected',
            color: isActive ? 'inherit' : 'text.secondary',
          }}
        />
      )}
    </Box>
  );

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search for movies, descriptions, or keywords..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchInput && (
              <InputAdornment position="end">
                <IconButton onClick={handleSearchClear} size="small">
                  ×
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'background.paper',
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
      </Box>

      {/* Mobile Filter Toggle */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <Box
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              py: 1,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Filters
            </Typography>
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        </Box>
      )}

      {/* Filter Tabs */}
      <Collapse in={!isMobile || showFilters}>
        {isMobile ? (
          // Mobile: Vertical filter chips
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filterTabs.map((tab) => (
              <TabComponent
                key={tab.value}
                tab={tab}
                isActive={currentFilter === tab.value}
                onClick={() => onFilterChange(tab.value)}
              />
            ))}
          </Box>
        ) : (
          // Desktop: Horizontal tabs
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filterTabs.map((tab) => (
              <TabComponent
                key={tab.value}
                tab={tab}
                isActive={currentFilter === tab.value}
                onClick={() => onFilterChange(tab.value)}
              />
            ))}
          </Box>
        )}
      </Collapse>

      {/* Active Filters Display */}
      {(currentSearch || currentFilter !== 'all') && (
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active filters:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {currentSearch && (
              <Chip
                label={`Search: "${currentSearch}"`}
                onDelete={() => onSearchChange('')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {currentFilter !== 'all' && (
              <Chip
                label={filterTabs.find(tab => tab.value === currentFilter)?.label}
                onDelete={() => onFilterChange('all')}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default MovieFilters;