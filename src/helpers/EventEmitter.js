export class EventEmitter
{

  constructor() {
    this.events = [];
  }

  on(eventName, callback)
  {
      if ( this.events[ eventName ] == null )
      {
          this.events[ eventName ] = [];
      }

      this.events[ eventName ].push( callback );
  }

  triggerEvent(eventName, ...args)
  {
      let callbacks = this.events[eventName];

      if ( callbacks != null )
      {
        for (var i = 0, l = callbacks.length; i < l; i++) {
              let result = callbacks[i].apply(null, args);
              if(result === false)
              {
                return false;
              }
        }
      }
      return true;
  }

}
