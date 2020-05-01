import Color from '../../rpc/color.js';

export default {
  namespaced: true,
  state: {
    id: null,
    account_id: null,
    name: null,
    foreground: null,
    background: null,
    original: 0
  },
  getters: {
    ACCOUNT: function( state ) {
      return state.account_id;
    },
    BACKGROUND: function( state ) {
      return state.background;
    },
    FOREGROUND: function( state ) {
      return state.foreground;
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
    SET_BACKGROUND: function( state, background ) {
      state.background = background;
    },    
    SET_FOREGROUND: function( state, foreground ) {
      state.foreground = foreground;
    },    
    SET_ID: function( state, id ) {
      state.id = id;
    },
    SET_NAME: function( state, name ) {
      state.name = name;
    },
    SET_ORIGINAL: function( state, original ) {
      state.original = original;
    }
  },
  actions: {
    CREATE_COLOR: async function( context ) {
      let result = await Color.create( context.rootGetters.TOKEN, {
        name: context.getters.NAME,
        foreground: context.getters.FOREGROUND,
        background: context.getters.BACKGROUND,
      } );
      context.dispatch( 'SET_ACCOUNT', result.account_id );
      context.dispatch( 'SET_ID', result.id ); 

      context.rootGetters['COLORS'].push( result );
      context.rootGetters['COLORS'].sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0
      } );      

      for( let c = 0; c < context.rootGetters['COLORS'].length; c++ ) {
        if( context.rootGetters['COLORS'][c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }
    },
    REMOVE_COLOR: function( context, id ) {
      Color.remove( context.rootGetters.TOKEN, id );
    },
    SET_ACCOUNT: function( context, account ) {
      context.commit( 'SET_ACCOUNT', account );
    },
    SET_BACKGROUND: function( context, background ) {
      context.commit( 'SET_BACKGROUND', background );
    },
    SET_FOREGROUND: function( context, foreground ) {
      context.commit( 'SET_FOREGROUND', foreground );
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
    UPDATE_COLOR: async function( context ) {
      let result = await Color.update( context.rootGetters.TOKEN, {
        id: context.getters.ID,
        name: context.getters.NAME,
        foreground: context.getters.FOREGROUND,
        background: context.getters.FOREGROUND
      } );

      context.rootGetters.COLORS[context.getters.ORIGINAL].name = result.name;
      context.rootGetters.COLORS[context.getters.ORIGINAL].foreground = result.foreground;
      context.rootGetters.COLORS[context.getters.ORIGINAL].background = result.background;      

      context.rootGetters['COLORS'].sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0
      } );      

      for( let c = 0; c < context.rootGetters['COLORS'].length; c++ ) {
        if( context.rootGetters['COLORS'][c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }      
    },    
  }
}
