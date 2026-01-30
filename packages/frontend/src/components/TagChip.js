import React from 'react';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Component for displaying a tag as a chip
 * @param {Object} props - Component props
 * @param {Object} props.tag - The tag object {id, name, color}
 * @param {Function} props.onDelete - Optional callback when tag is removed
 * @param {boolean} props.deletable - Whether the chip can be deleted
 * @param {string} props.size - Chip size ('small' or 'medium')
 * @param {Function} props.onClick - Optional callback when chip is clicked
 */
function TagChip({ tag, onDelete, deletable = false, size = 'small', onClick }) {
  if (!tag) return null;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(tag);
    }
  };

  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick(tag);
    }
  };

  return (
    <Chip
      label={tag.name}
      size={size}
      onClick={onClick ? handleClick : undefined}
      onDelete={deletable ? handleDelete : undefined}
      deleteIcon={deletable ? <CloseIcon /> : undefined}
      sx={{
        backgroundColor: tag.color,
        color: '#fff',
        fontWeight: 500,
        '&:hover': {
          backgroundColor: tag.color,
          filter: 'brightness(0.9)',
        },
        cursor: onClick ? 'pointer' : 'default',
      }}
    />
  );
}

export default TagChip;
