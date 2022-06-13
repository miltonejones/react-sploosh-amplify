import dynamoStorage from './DynamoStorage';
import { SEED_DATA } from './Seed'
const RECENT_WATCHED_SETTING_NAME = 'video-recent-watched-id-list';

class VideoPersistService$ {

  limit = 1000000;
  seed = SEED_DATA;
  store = dynamoStorage()
  constructor() { 
    this.init()
  }

  async init() {
    const storage = await this.store.getItem(RECENT_WATCHED_SETTING_NAME)
    if (!storage) {
      await this.store.setItem(RECENT_WATCHED_SETTING_NAME, JSON.stringify(SEED_DATA))
    }
  }

  async add(track) { 
    const existing = await this.get();
    const setting = existing.filter((old) => old !== track.ID);
    setting.unshift(track.ID);
    await this.set(setting);
    console.log (`Added ${track.title} to cache:`);
    console.log(`${JSON.stringify(setting).length} bytes.`);
  }

  async list() {
    const setting = await this.get();
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

  async getSetting(name) {
    return await this.store.getItem(name)
  }

  async setSetting(name, value) {
    await this.store.setItem(name, value)
  }

  async set(setting) {
    await this.setSetting(RECENT_WATCHED_SETTING_NAME, JSON.stringify(this.trim(setting)));
  }

  async clear() {
    await this.setSetting(RECENT_WATCHED_SETTING_NAME, '[]');
  }

  async get() {
    const storage = await this.getSetting(RECENT_WATCHED_SETTING_NAME)
    try {
      return JSON.parse(storage || []);
    } catch (e) { return []; }
  }


}

const VideoPersistService = new VideoPersistService$();

export {
  VideoPersistService
}
