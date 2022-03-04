import { SEED_DATA } from './Seed'
const RECENT_WATCHED_SETTING_NAME = 'video-recent-watched-id-list';

class VideoPersistService$ {

  limit = 1000000;
  seed = SEED_DATA;
  constructor() {
    // alert(SEED_DATA.length)
    if (!!localStorage[RECENT_WATCHED_SETTING_NAME]) return;
     localStorage[RECENT_WATCHED_SETTING_NAME] = JSON.stringify(SEED_DATA);
    // this.list()
  }

  add(track) {
    const setting = this.get().filter((old) => old !== track.ID);
    setting.push(track.ID);
    this.set(setting);
    console.warn(`Added ${track.title} to cache:`);
    console.log(`${JSON.stringify(setting).length} bytes.`);
  }

  list() {
    const setting = this.get();
    console.table(setting);
    console.log(`${JSON.stringify(setting).length} bytes.`);
  }

  trim(setting) {
    let size = JSON.stringify(setting).length;
    while (size > this.limit) {
      setting.shift();
      size = JSON.stringify(setting).length;
    }
    return setting;
  }

  getSetting(name) {
    return localStorage[name];
  }

  setSetting(name, value) {
    localStorage[name] = value;
  }

  set(setting) {
    this.setSetting(RECENT_WATCHED_SETTING_NAME, JSON.stringify(this.trim(setting)));
  }

  clear() {
    this.setSetting(RECENT_WATCHED_SETTING_NAME, '[]');
  }

  get() {
    try {
      return JSON.parse(this.getSetting(RECENT_WATCHED_SETTING_NAME) || []);
    } catch (e) { return []; }
  }


}

const VideoPersistService = new VideoPersistService$();

export {
  VideoPersistService
}
