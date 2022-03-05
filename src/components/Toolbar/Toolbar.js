import * as React from 'react';
import { TextField, Box , Avatar, IconButton, InputAdornment } from '@mui/material';
import { Search, Menu } from '@mui/icons-material';
import { Flex, Spacer } from '../';
import useSploosh, { SplooshContext }  from '../../hooks/useSploosh';
import {  
    Link
  } from "react-router-dom";

export default function Toolbar ({ viewIndex = 0}) {

    // const sploosh = useSploosh({});
    const {
        setState,
        navigate,
        pageNames,
        pageIndex = 0,
        iconClass,
        SearchIcon,
        searchDrawerOpen,
        search,
        param
    } = React.useContext(SplooshContext);

    const screenIndex = viewIndex || pageIndex;

    return (<>
          {/* toolbar */}
    <Box className="toolbar">
        <Flex sx={{ textAlign: 'left' }}>

          <IconButton onClick={() => setState('searchDrawerOpen', !searchDrawerOpen)}>
            <Menu />
          </IconButton>

          <Avatar onClick={() => navigate('/')} sx={{ml: 4, mr: 4}} 
              src="https://s3.amazonaws.com/sploosh.me.uk/assets/sploosh.png" 
              alt="logo" />
              
              
          {pageNames.map((p, i) => (
            <Link 
              className={screenIndex === i ? "link on" : "link"} 
              key={p.href} 
              to={p.href}>{p.label}</Link>))}

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

    </>)
}