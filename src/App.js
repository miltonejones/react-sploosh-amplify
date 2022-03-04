import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import InputAdornment from '@mui/material/InputAdornment';
import { VideoCollection, Flex, Spacer, SearchDrawer } from './components';
import { TextField, Box , Tab, Tabs, Avatar, Collapse, IconButton } from '@mui/material';
import { Search, Sync, Close, Menu } from '@mui/icons-material';
import { BrowserRouter, useParams ,Routes, Route, useNavigate, Link} from "react-router-dom";


function VideoGrid (props) {
  const {
    SearchIcon,
    iconClass,
    search,
    param,
    setState,
    args,
    navigate,
    queryParam,
    searches,
    locate,
    searchDrawerOpen,
    pageNames,
    pageIndex,
    removeTab
  } = useApp(props);
  const tabValue = searches?.map(f => f.param).indexOf(queryParam) + 1;
  const handleChange = (event, newValue) => {
    if (newValue === 0) navigate(`/video/1`)  
    if (newValue === searches.length + 1) { 
      const doomed = searches[tabValue - 1].param;
      return removeTab(doomed)
    }
    const s = searches[newValue - 1];
    navigate(`/search/${s.param}/1`)  
  };

  return (
    <Box className="App">

      {/* toolbar */}
      <Box className="toolbar">
        <Flex sx={{ textAlign: 'left' }}>
          <IconButton onClick={() => setState('searchDrawerOpen', !searchDrawerOpen)}>
            <Menu />
          </IconButton>
          <Avatar onClick={() => navigate('/')} sx={{ml: 4, mr: 4}} 
              src="https://s3.amazonaws.com/sploosh.me.uk/assets/sploosh.png" 
              alt="logo" />
              
              
              {pageNames.map((p, i) => <Link className={pageIndex === i ? "link on" : "link"} key={p.href} to={p.href}>{p.label}</Link>)}


          <Spacer />
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
      
      {/* search tabs */}
      <Collapse className="head" in={!!searches.length}>
        <Tabs onChange={handleChange} value={tabValue}>
          <Tab label="All Videos"/>
          {searches?.map (s => <Tab label={s.param} key={s.param} />)} 
          <Tab icon={<Close />} />
        </Tabs>
      </Collapse>

      {/* video grid */}
      <VideoCollection {...args} />
      <SearchDrawer onClick={locate} onClose={() => setState('searchDrawerOpen', false)} open={searchDrawerOpen} />
    </Box>
  );

  
}
 

export default function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<VideoGrid  pageIndex={0}/>} />
    <Route path="/recent/:videoPageNum" element={<VideoGrid pageIndex={2} queryType="recent" />} />
    <Route path="/heart/:videoPageNum" element={<VideoGrid pageIndex={1} queryType="heart" />} />
    <Route path="/video/:videoPageNum" element={<VideoGrid pageIndex={0} />} />
    <Route path="/search/:queryParam/:videoPageNum" element={<VideoGrid pageIndex={0} />} />
  </Routes>
</BrowserRouter>
}


function useApp ({ queryType, pageIndex }) {
  let navigate = useNavigate();
  const { videoPageNum = 1, queryParam } = useParams();
  const gridType = !queryParam ? 'video' : 'search';
  const { state, setState } = useComponentState({
    page: videoPageNum,
    param: queryParam,
    collectionType: queryType || gridType,
    busy: false, 
    searches: []
  });
  const { page, param, collectionType, searches, busy } = state;

  const prefix = !queryParam ? '' : `/${queryParam}`
  const removeTab = (p) => {
    const tabs = searches.filter (t => t.param !== p) 
    setState('param', null)
    setState('searches', tabs)
    navigate(`/`) 
  };

  const locate = (p) => {
    const tabs = searches.find (t => t.param === p)
      ? searches 
      : searches.concat({
        type: 'search',
        param: p
      })
    setState('param', p)
    setState('searches', tabs)
    navigate(`/search/${p}/1`) 
  };

  const search = () => {
    locate(param)
  };

  const args = {
    setBusy: b => setState('busy', b),
    collectionType: queryType || gridType,
    searchParam: queryParam,
    pageNum: parseInt(videoPageNum),
    onChange: locate,
    navigate
  };

  const SearchIcon = busy ? Sync : Search;
  const iconClass = busy ? 'spin' : '';
  const pageNames = [
    {label:'videos',href:'/'}, 
    {label:'favorites',href:'/heart/1'}, 
    {label:'recently seen',href:'/recent/1'}, 
    {label:'models',href:'/'}, 
   ]
  return {
    SearchIcon,
    iconClass,
    search,
    setState,
    args,
    searches,
    navigate,
    queryParam,
    removeTab,
    locate,
    pageNames,
    pageIndex,
    ...state
  }
}