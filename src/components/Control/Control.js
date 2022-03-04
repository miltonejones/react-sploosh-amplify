import React from 'react';
import { Pagination } from '@mui/material';

export const StyledPagination = ({ totalPages, page, handleChange }) => {
  if (totalPages < 2) {
    return <i />;
  }
  return (
    <Pagination
      sx={{p: 1}}
      color="primary"
      showFirstButton
      showLastButton
      shape="rounded"
      count={totalPages}
      page={page}
      siblingCount={2}
      onChange={handleChange}
    />
  );
};
