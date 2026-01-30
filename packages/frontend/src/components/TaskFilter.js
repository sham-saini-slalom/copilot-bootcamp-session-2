import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TagChip from './TagChip';

/**
 * Component for filtering tasks by tags
 * @param {Object} props - Component props
 * @param {Array} props.tags - Array of available tags
 * @param {Object} props.selectedTag - Currently selected tag filter (or null for all)
 * @param {Function} props.onTagSelect - Callback when tag filter changes
 */
function TaskFilter({ tags = [], selectedTag = null, onTagSelect }) {
  const handleTagClick = (tag) => {
    if (onTagSelect) {
      // Toggle: if same tag clicked, clear filter
      onTagSelect(selectedTag?.id === tag.id ? null : tag);
    }
  };

  const handleClearFilter = () => {
    if (onTagSelect) {
      onTagSelect(null);
    }
  };

  if (tags.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        Filter by tag:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Chip
          label="All Tasks"
          size="small"
          onClick={handleClearFilter}
          variant={selectedTag === null ? 'filled' : 'outlined'}
          color={selectedTag === null ? 'primary' : 'default'}
        />
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            tag={tag}
            onClick={handleTagClick}
            size="small"
          />
        ))}
      </Box>
      {selectedTag && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Showing tasks tagged with "{selectedTag.name}"
        </Typography>
      )}
    </Box>
  );
}

export default TaskFilter;
