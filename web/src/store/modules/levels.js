import Level from '../../rpc/level.js';

export default {
  namespaced: true,
  state: {
    id: null,
    account_id: null,
    name: null,
    low: 0,
    high: 0,
    count: 0,
    original: 0
  },
  getters: {
    ACCOUNT: function( state ) {
      return state.account_id;
    },
    HIGH: function( state ) {
      return state.high;
    },
    LOW: function( state ) {
      return state.low;
    },
    COUNT: function( state ) {
      return state.count;
    },
    ID: function( state ) {
      return state.id;
    },
    NAME: function( state ) {
      return state.name;
    },
    ORIGINAL: function( state ) {
      return state.original;
    }
  },
  mutations: {
    SET_ACCOUNT: function( state, account ) {
      state.account_id = account;
    },
    SET_ID: function( state, id ) {
      state.id = id;
    },
    SET_HIGH: function( state, high ) {
      state.high = high;
    },
    SET_LOW: function( state, low ) {
      state.low = low;
    },
    SET_COUNT: function( state, count ) {
      state.count = count;
    },
    SET_NAME: function( state, name ) {
      state.name = name;
    },
    SET_ORIGINAL: function( state, original ) {
      state.original = original;
    }
  },
  actions: {
    CREATE_LEVEL: async function( context ) {
      let result = await Level.create( context.rootGetters.TOKEN, {
        name: context.getters.NAME,
        high: context.getters.HIGH,
        low: context.getters.LOW
      } );
      result.count = 0;        
      result.high = context.getters.HIGH;
      result.low = context.getters.LOW;

      context.rootGetters['LEVELS'].push( result );
      context.rootGetters['LEVELS'].sort( ( a, b ) => {
        if( a.low > b.low ) return 1;
        if( a.low < b.low ) return -1;
        return 0
      } );      

      for( let c = 0; c < context.rootGetters['LEVELS'].length; c++ ) {
        if( context.rootGetters['LEVELS'][c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }      
    },
    REMOVE_LEVEL: function( context, id ) {
      Level.remove( context.rootGetters.TOKEN, id );
    },
    SET_ACCOUNT: function( context, account ) {
      context.commit( 'SET_ACCOUNT', account );
    },
    SET_HIGH: function( context, high ) {
      context.commit( 'SET_HIGH', parseInt( high ) );
    },
    SET_LOW: function( context, low ) {
      context.commit( 'SET_LOW', parseInt( low ) );
    },
    SET_COUNT: function( context, count ) {
      context.commit( 'SET_COUNT', parseInt( count ) );
    },
    SET_ID: function( context, id ) {
      context.commit( 'SET_ID', id );
    },
    SET_NAME: function( context, named ) {
      context.commit( 'SET_NAME', named );
    },
    SET_ORIGINAL: function( context, original ) {
      context.commit( 'SET_ORIGINAL', original );
    },
    UPDATE_LEVEL: async function( context ) {
      let result = await Level.update( context.rootGetters.TOKEN, {
        id: context.getters.ID,
        name: context.getters.NAME,
        high: context.getters.HIGH,
        low: context.getters.LOW
      } );

      context.rootGetters.LEVELS[context.getters.ORIGINAL].name = result.name;
      context.rootGetters.LEVELS[context.getters.ORIGINAL].high = result.high;
      context.rootGetters.LEVELS[context.getters.ORIGINAL].low = result.low;

      context.rootGetters['LEVELS'].sort( ( a, b ) => {
        if( a.low > b.low ) return 1;
        if( a.low < b.low ) return -1;
        return 0
      } );
      
      for( let c = 0; c < context.rootGetters['LEVELS'].length; c++ ) {
        if( context.rootGetters['LEVELS'][c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }            
    }
  }
}
