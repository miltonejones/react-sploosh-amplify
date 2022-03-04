import * as React from 'react';
import { SearchPersistService } from '../../services/SearchPersist';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';


export default function SearchDrawer ({open, onClose, onClick}) {
    const [searches, setSearches] = React.useState(null)

    React.useEffect(() => {
        !searches && setSearches(SearchPersistService.getSavedSearches())
    }, [searches])

    return <>
    <Drawer
        classes={{ root: 'maxWidth', paper: 'maxWidth' }}
        anchor="left"
        open={open}
        onClose={onClose}
        >

         <List dense>
          {searches?.map (s => (<ListItem onClick={() => {
              onClick(s);
              onClose()
          }} key={s} disablePadding>
            <ListItemButton>
              <ListItemText primary={s} />
            </ListItemButton>
          </ListItem>))} 
        </List>

        {/* <pre>{JSON.stringify(searches,0,2)}</pre> */}
        </Drawer>
    </>
}

