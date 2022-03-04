import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import InputAdornment from '@mui/material/InputAdornment';
import { VideoCollection, Flex } from './components';
import { TextField, Box , Tab, Tabs } from '@mui/material';
import { Search, Sync } from '@mui/icons-material';
import { BrowserRouter, useParams ,Routes, Route, useNavigate} from "react-router-dom";


function VideoGrid (props) {
  const {
    SearchIcon,
    iconClass,
    search,
    param,
    setState,
    args,
  } = useApp();
  return (
    <Box className="App">
      <Box className="head" sx={{ p: 1 }}>
        <Flex sx={{ textAlign: 'left' }}>
          <TextField  
           InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className={iconClass} />
                </InputAdornment>
              ),
            }}
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
 

export default function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<VideoGrid />} />
    <Route path="/video/:videoPageNum" element={<VideoGrid />} />
    <Route path="/search/:queryParam/:videoPageNum" element={<VideoGrid />} />
  </Routes>
</BrowserRouter>
}


function useApp () {
  let navigate = useNavigate();
  const { videoPageNum = 1, queryParam } = useParams();
  const gridType = !queryParam ? 'video' : 'search';
  const { state, setState } = useComponentState({
    page: videoPageNum,
    param: queryParam,
    collectionType: gridType,
    busy: false, 
    searches: []
  });
  const { page, param, collectionType, searches, busy } = state;
  const prefix = !queryParam ? '' : `/${queryParam}`
  const args = {
    setBusy: b => setState('busy', b),
    collectionType: gridType,
    searchParam: queryParam,
    pageNum: parseInt(videoPageNum),
    onChange: (v) => navigate(v),
  };

  const search = () => {
    navigate(`/search/${param}/1`) 
  };

  const SearchIcon = busy ? Sync : Search;
  const iconClass = busy ? 'spin' : '';
  return {
    SearchIcon,
    iconClass,
    search,
    setState,
    args,
    ...state
  }
}