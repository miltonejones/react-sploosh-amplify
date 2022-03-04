class SearchPersistService$ {

    searchParam = '';
    savedParams = '';
    cookieName = 'saved-video-app-searches';
    // onChange);
    // onDrop); 
  
    exists(value) {
      return this.getSavedSearches().filter((f) => f === value).length;
    }
  
    getSavedSearches() {
      const cookieData = localStorage[this.cookieName];
      if (cookieData?.length) {
        const searchObject = JSON.parse(cookieData);
        if (searchObject?.length) {
          return searchObject;
        }
      }
      return SEARCH_SEED;
    }
  
    dropSearch(value) {
      const existed = this.getSavedSearches().filter((f) => f !== value);
      this.save(existed);
      // this.onDrop.emit(existed);
      // this.onChange.emit(existed);
    }
  
    updateSearch(oldvalue, newvalue) {
      const existed = this.getSavedSearches().filter((f) => f !== oldvalue);
      existed.push(newvalue);
      this.save(existed);
    }
  
    editSearch(value) {
      const existed = this.getSavedSearches().filter((f) => f !== value);
      const updated = prompt('Enter new value:', value);
      existed.push(updated);
      this.save(existed);
      // this.onChange.emit(updated);
    }
  
    save(param) {
      localStorage[this.cookieName] = JSON.stringify(param);
    }
  
    saveSearch(value) {
      const param = this.getSavedSearches();
      param.push(value);
      this.save(param);
      console.log(param, 'saved');
    }
  }
  
  const SEARCH_SEED = ["dad|papa|daught|father", "tiny tit|a-cup|a cup|13*cm|14*cm", "mom|mother|son", "wife,protect|debt|please|forgive|sorry|reason|father|boss|rape", "walks in on|next to|in front of|behind her back", "rape|molest|attack", "mom|mother|stepson", "big  dick|bigdick|monster cock|huge cock|big cock|horse cock|horse hung", "nurse|hosp", "shirt|no bra |see-through|see through|sheer", "panti|panch|panty shot|pantyshot", "3p|dp|threesome", "caba|pub |pinsa", "booty| ass |butt", "lesb|girlsway", "wank|jerk|masturbat|strokes|stroking", "self-suck|self suck|selfsuck", "dp |3p", "aphro|drug|potion", "shemale|she-male|tranny|transex| ts |ladyboy|lady boy"]
  
  
  const SearchPersistService = new SearchPersistService$()
  
  export {
    SearchPersistService
  }
  