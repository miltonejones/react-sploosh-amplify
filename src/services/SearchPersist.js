import dynamoStorage from "./DynamoStorage";

 


class SearchPersistService$ {

    searchParam = '';
    savedParams = '';
    cookieName = 'saved-video-app-searches-db';
    store = dynamoStorage();
  
    async exists(value) {
      const savedSearches = await this.getSavedSearches();
      return savedSearches.filter((f) => f === value).length;
    }
  
    async getSavedSearches() {
      const cookieData = await this.store.getItem(this.cookieName);  
      if (cookieData?.length) {
        console.log ({cookieData})
        const searchObject = JSON.parse(cookieData);
        if (searchObject?.length) {
          return searchObject;
        }
      } 
      await this.store.setItem(this.cookieName, JSON.stringify(SEARCH_SEED))
      return SEARCH_SEED;
    }
  
    async dropSearch(value) {
      const savedSearches = await this.getSavedSearches(); 
      await this.save(savedSearches.filter((f) => f !== value)); 
    }
  
    async updateSearch(oldvalue, newvalue) {
      const savedSearches = await this.getSavedSearches(); 
      await this.save(savedSearches.filter((f) => f !== oldvalue).concat(newvalue));
    }
  
    async pinSearch(value) {
      const savedSearches = await this.getSavedSearches();
      const newvalue = value.indexOf('^') > 0 ? value.replace('^', '') : `${value}^`;
      await this.save(savedSearches.filter((f) => f !== value).concat(newvalue));
    }
  
    async editSearch(updated, value) {
      const savedSearches = await this.getSavedSearches();
      const existed = savedSearches.filter((f) => f !== value); 
      existed.push(updated);
      this.save(existed); 
    }
  
    async save(param) {
      await this.store.setItem(this.cookieName, JSON.stringify(param)) 
    }
  
    async saveSearch(value) {
      const param = await this.getSavedSearches(); 
      await this.save(param.concat(value));
      console.log(param, 'saved');
    }
  }
  
  const SEARCH_SEED = ["dad|papa|daught|father", "tiny tit|a-cup|a cup|13*cm|14*cm", "mom|mother|son", "wife,protect|debt|please|forgive|sorry|reason|father|boss|rape", "walks in on|next to|in front of|behind her back", "rape|molest|attack", "mom|mother|stepson", "big  dick|bigdick|monster cock|huge cock|big cock|horse cock|horse hung", "nurse|hosp", "shirt|no bra |see-through|see through|sheer", "panti|panch|panty shot|pantyshot", "3p|dp|threesome", "caba|pub |pinsa", "booty| ass |butt", "lesb|girlsway", "wank|jerk|masturbat|strokes|stroking", "self-suck|self suck|selfsuck", "dp |3p", "aphro|drug|potion", "shemale|she-male|tranny|transex| ts |ladyboy|lady boy"]
  
  
  const SearchPersistService = new SearchPersistService$()
  
  export {
    SearchPersistService
  }
  