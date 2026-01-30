import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import TagChip from './TagChip';

/**
 * Component for selecting multiple tags
 * @param {Object} props - Component props
 * @param {Array} props.availableTags - Array of all available tags
 * @param {Array} props.selectedTags - Array of currently selected tags
 * @param {Function} props.onTagsChange - Callback when tags change
 * @param {boolean} props.disabled - Whether the selector is disabled
 */
function TagSelector({ availableTags = [], selectedTags = [], onTagsChange, disabled = false }) {
  const handleChange = (event, newValue) => {
    if (onTagsChange) {
      onTagsChange(newValue);
    }
  };

  return (
    <Autocomplete
      multiple
      options={availableTags}
      getOptionLabel={(option) => option.name}
      value={selectedTags}
      onChange={handleChange}
      disabled={disabled}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderTags={(value, getTagProps) =>
        value.map((tag, index) => (
          <TagChip
            key={tag.id}
            tag={tag}
            {...getTagProps({ index })}
            deletable={true}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Tags"
          placeholder="Select tags"
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <TagChip tag={option} size="small" />
          <Box sx={{ ml: 1 }}>{option.name}</Box>
        </Box>
      )}
    />
  );
}

export default TagSelector;
