import * as React from 'react';
import { SearchPersistService } from '../../services/SearchPersist';
import Drawer from '@mui/material/Drawer'; 
import { styled } from '@mui/material';
import { Edit, PushPin, Delete, Sync } from '@mui/icons-material';

import { 
  SystemDialog, 
  useSystemDialog 
} from '../';

const UL = styled('ul')({
  padding: 0,
  margin: 0,
  listStyle: 'none'
})

const LI = styled('li')(({header}) => ({
  display: 'flex',
  position: 'relative', 
  padding: header ? '16px 8px' : 8,
  '& .titlebox': {
    maxWidth: 300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  '& .menubox': {
    cursor: 'pointer',
    position: 'absolute',
    right: 8,
    display: 'flex',
    gap: 8,
    opacity: 0
  },
  '&:hover': {
    textDecoration: 'underline',
    '& .menubox': {
      opacity: 0.3,
      '&:hover': {
        opacity: 1
      },
    },
  },
}))


export default function SearchDrawer ({open, onClose, onClick}) {
    const [searches, setSearches] = React.useState(null)
    const { systemDialogState, Prompt, Confirm } = useSystemDialog();

    const pinSearch = async (value) => {
      await SearchPersistService.pinSearch(value);
      const existing = await SearchPersistService.getSavedSearches();
      setSearches(existing)
    }

    const editSearch = async (value) => {
      const updated = await Prompt('Enter new value:', value, 'Edit Search')
      await SearchPersistService.editSearch(updated, value);
      const existing = await SearchPersistService.getSavedSearches();
      setSearches(existing)
    }

    const dropSearch = async (value) => {
      const yes = await Confirm('Are you sure you want to delete ' + value + '?')
      if (!yes) return; 
      await SearchPersistService.dropSearch(value);
      const existing = await SearchPersistService.getSavedSearches();
      setSearches(existing)
    }

    React.useEffect(() => {
        !searches && (async()=>{
          const existing = await SearchPersistService.getSavedSearches();
          setSearches(existing)
        })()
    }, [searches])

    console.log ({searches})

    const pinned = searches?.filter (f => f && f.indexOf('^') > 0).map(f => f.replace('^', ''));
    const unpinned = searches?.filter (f => f && f.indexOf('^') < 0);

    return <>
    <Drawer
        classes={{ root: 'maxWidth', paper: 'maxWidth' }}
        anchor="left"
        open={open}
        onClose={onClose}
        >

         <UL>

<LI header><b>Pinned Searches</b>


<div className="menubox">
              <Sync onClick={async() => {
                   const existing = await SearchPersistService.getSavedSearches();
                   setSearches(existing)
              }} />
            </div>

</LI>

         {pinned?.map (s => (<LI key={s} disablePadding>
           
           <div className="titlebox" onClick={() => {
              onClick(s);
              onClose()
          }}>
         {s}
           </div>
           
            <div className="menubox">
              <PushPin onClick={async() => await pinSearch(s + '^')} /> 
              <Delete onClick={async() => await dropSearch(s + '^')} />
            </div>

          </LI>))} 

          

<LI header><b>Saved Searches</b></LI>

          {unpinned?.map (s => (<LI key={s} disablePadding>
           
           <div className="titlebox" onClick={() => {
              onClick(s);
              onClose()
          }}>
           {s}
           </div>

            <div className="menubox">
              <PushPin onClick={async() => await pinSearch(s)} />
              <Edit onClick={async() => await editSearch(s)} />
              <Delete  onClick={async() => await dropSearch(s)} />
            </div>

          </LI>))} 


        </UL>

        <SystemDialog {...systemDialogState}/>
        {/* <pre>{JSON.stringify(searches,0,2)}</pre> */}
        </Drawer>
    </>
}

