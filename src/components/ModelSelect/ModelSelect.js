import * as React from 'react';
import { useTheme } from '@mui/material/styles'; 

import { Popover, Typography , Avatar, FormControl} from '@mui/material';
import { TextBox, UL, LI } from '../';
import { getModelsByName } from '../../connector/DbConnector';
 
 
export default function ModelSelect({ onSelect, onCreate }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null); 
  const [open, setOpen] = React.useState(false); 
  const [stars, setStars] = React.useState([]); 
  const [param, setParam] = React.useState(''); 
 


  const handleClick = (event) => {
    console.log(event)
    setAnchorEl(event.target);
  };

  const handleClose = () => {
    // setAnchorEl(null); 
    setOpen(false)
  };

  const createModel = name => {
    onCreate && onCreate(name);
    handleClose()
  }


  const selectModel = id => {
    onSelect && onSelect(id);
    handleClose()
  }


  const getModels = async (name, event) => {
    const models = await getModelsByName(name)
    setParam(name)
    setStars(models)
    handleClick(event)
    setOpen(true)
  }

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}> 

        <TextBox onEnter={(v, e) => getModels(v, e)} onChange={(x, e) => handleClick(e)} 
        placeholder="Find models" 
        label="Add Model" />


        <Popover 
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <UL>
        {stars?.map(star => <LI onClick={() => selectModel(star.ID)} key={star.ID}>
          <Avatar variant="rounded" src={star.image} alt={star.name} sx={{mr: 1}} />
          {star.name}</LI>)}

          <LI onClick={() => createModel(param)}>add "{param}" as new model</LI>

        </UL>
        {/* <Typography sx={{ p: 2 }}>The content of the Popover.</Typography> */}
      </Popover>

 
      </FormControl>
    </div>
  );
}
