import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import { VideoCollection, Flex } from './components';
import { TextField, Box } from '@mui/material';

export default function App() {
  const { state, setState } = useComponentState({
    page: 1,
    param: '',
    collectionType: 'video',
  });
  const { page, param, collectionType } = state;

  const args = {
    collectionType,
    searchParam: param,
    pageNum: page,
    onChange: (v) => setState('page', v),
  };

  const search = () => {
    setState('page', 1);
    setState('collectionType', 'search');
  };

  return (
    <Box>
      <Box className="head" sx={{ pl: 2, pb: 1 }}>
        <Flex sx={{ textAlign: 'left' }}>
          <TextField
            size="small"
            label="Search"
            placeholder="Enter search params"
            value={param}
            onKeyUp={(e) => e.keyCode === 13 && search()}
            onChange={(e) => setState('param', e.target.value)}
          />
        </Flex>
      </Box>
      <VideoCollection {...args} />
    </Box>
  );
}
