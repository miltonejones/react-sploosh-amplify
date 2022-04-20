import React from 'react';
import LocalObjectStorage, { indexDbResponse, LOCAL_DATABASE_STATE } from '../services/LocalData';
import { getModels } from '../connector/DbConnector';

const TABLE_DEF = {
  name: "modelTable",
  key: "ID",
  fields: ["name", "image", "ID"],
};
const indexName = "localStarDb2";
const versionNo = 1;
   
const db = new LocalObjectStorage();

export default function useModelStorage() {
  const [storageState, setStorageState] = React.useState({modelPage: 1});
  const { dbStatus, modelPage, modelList } = storageState;

  const insertRows = React.useCallback(async (page = 1) => {
    const { records } = await getModels(page);
    console.log ({ page, dbStatus })
    if (!!records?.length) { 
      const response = await db.insert(TABLE_DEF.name, records);
      console.log ({ response })
      return await insertRows(++page)
    }
    return console.log('Add rows were added')
  })

  const findModelsByName = async (modelName) => { 
    return await db.select(TABLE_DEF.name, row => row.name.toLowerCase().indexOf(modelName) > -1)
  }

  React.useEffect(() => {
    const sub = indexDbResponse.subscribe(event => {
      setStorageState(s => ({...s, ...event}));
      console.log (JSON.stringify(event,0,2))
    });

    console.log ( { dbStatus })

    if (dbStatus === LOCAL_DATABASE_STATE.CONNECTED) {
      db.tally(TABLE_DEF.name).then(count =>{
        if (count > 0) {
          console.log(`${count} model rows found`)
          return; 
        }
        insertRows ();
      });
      return;
    }

    db.init([TABLE_DEF], indexName, versionNo)
    db.connect().then(console.log)
    return () => sub.unsubscribe();
  }, [dbStatus]);

  return { 
    ...storageState,
    findModelsByName
  }
}