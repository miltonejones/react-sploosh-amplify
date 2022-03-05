import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import InputAdornment from '@mui/material/InputAdornment';
import { VideoCollection, ModelGrid, SearchDrawer, Toolbar, ModelModal } from './components';
import { Box , Tab, Tabs, Collapse } from '@mui/material';
import { Close } from '@mui/icons-material';
import { 
  BrowserRouter,  
  Routes, 
  Route
} from "react-router-dom";
import useSploosh, { SplooshContext } from './hooks/useSploosh';

function VideoGrid (props) {
  const sploosh = useSploosh(props);
  const {  
    search,
    param,
    setState,
    args,
    navigate,
    queryParam,
    searches,
    locate,
    searchDrawerOpen,
    modelModalState, 
    pageIndex,
    removeTab 
  } = sploosh;
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

  const Component = pageIndex < 3 ? VideoCollection : ModelGrid;

  return (
    <SplooshContext.Provider value={{ ...sploosh }}>
      <Box className="App">

        {/* toolbar */}
        <Toolbar viewIndex={pageIndex} />
        
        {/* search tabs */}
        <Collapse className="head" in={!!searches.length}>
          <Tabs onChange={handleChange} value={tabValue}>
            <Tab label="All Videos"/>
            {searches?.map (s => <Tab label={s.param} key={s.param} />)} 
            <Tab icon={<Close />} />
          </Tabs>
        </Collapse>

        {/* video grid */}
        <Component {...args} />

        <ModelModal {...modelModalState} />

        {/* search drawer */}
        <SearchDrawer 
          onClick={locate} 
          onClose={() => setState('searchDrawerOpen', false)} 
          open={searchDrawerOpen} />
      </Box>
    </SplooshContext.Provider>
  );
}
 

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<VideoGrid  pageIndex={0}/>} />
      <Route path="/model/:videoPageNum" element={<VideoGrid pageIndex={3} queryType="model"  />} />
      <Route path="/recent/:videoPageNum" element={<VideoGrid pageIndex={2} queryType="recent" />} />
      <Route path="/heart/:videoPageNum" element={<VideoGrid pageIndex={1} queryType="heart" />} />
      <Route path="/video/:videoPageNum" element={<VideoGrid pageIndex={0} />} />
      <Route path="/search/:queryParam/:videoPageNum" element={<VideoGrid pageIndex={0} />} />
    </Routes>
</BrowserRouter>
}

 