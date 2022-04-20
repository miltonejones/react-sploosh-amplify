export default class Observer {
    constructor(name) {
      this.name = name;
    }
    subscribe(fn) {
      const s = new Subscriber(fn, this.name);
      this.subs = (this.subs || []).concat(s);
      // const count = this.subs.filter((f) => !!f.fn).length;
      // console.log(count + " subscribers for '%s'", this.name);
      return s;
    }
    next(value) {
      this.subs?.map((s) => s.next(value));
    }
  }
  
  class Subscriber {
    constructor(fn, name) {
      this.name = name;
      this.fn = (this.fn || []).concat(fn);
    }
    next(value) {
      this.fn && this.fn.map((f) => f(value));
    }
    unsubscribe() { 
      this.fn = null;
    }
  }