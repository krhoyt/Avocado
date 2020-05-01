import Organization from '../../rpc/organization.js';

export default {
  namespaced: true,
  state: {
    id: null,
    account_id: null,
    name: null,
    color: 0,
    color_id: null,
    count: 0,
    original: 0
  },
  getters: {
    ACCOUNT: function( state ) {
      return state.account_id;
    },
    COLOR: function( state ) {
      return state.color;
    },
    COLOR_ID: function( state ) {
      return state.color_id;
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
    SET_COLOR: function( state, color ) {
      state.color = color;
    },
    SET_COLOR_ID: function( state, color_id ) {
      state.color_id = color_id;
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
    CREATE_ORGANIZATION: async function( context ) {
      let result = await Organization.create( context.rootGetters.TOKEN, {
        name: context.getters.NAME,
        color_id: context.rootGetters.COLORS[context.getters.COLOR].id
      } );
      context.dispatch( 'SET_ACCOUNT', result.account_id );
      context.dispatch( 'SET_ID', result.id );  

      result.count = 0;        
      result.color = context.getters.COLOR;

      context.rootGetters['ORGANIZATIONS'].push( result );
      context.rootGetters['ORGANIZATIONS'].sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0
      } );      

      for( let c = 0; c < context.rootGetters['ORGANIZATIONS'].length; c++ ) {
        if( context.rootGetters['ORGANIZATIONS'][c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }      
    },
    REMOVE_ORGANIZATION: function( context, id ) {
      Organization.remove( context.rootGetters.TOKEN, id );
    },
    SET_ACCOUNT: function( context, account ) {
      context.commit( 'SET_ACCOUNT', account );
    },
    SET_COLOR: function( context, color ) {
      context.commit( 'SET_COLOR', color );
    },
    SET_COLOR_ID: function( context, color_id ) {
      context.commit( 'SET_COLOR_ID', color_id );

      for( let c = 0; c < context.rootGetters.COLORS.length; c++ ) {
        if( color_id === null ) {
          if( context.rootGetters.COLORS[c].name === 'Gray' ) {
            context.commit( 'SET_COLOR', c );
            break;
          }
        } else {
          if( context.rootGetters.COLORS[c].id === color_id ) {
            context.commit( 'SET_COLOR', c );
            break;
          }
        }
      }
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
    UPDATE_ORGANIZATION: async function( context ) {
      let result = await Organization.update( context.rootGetters.TOKEN, {
        id: context.getters.ID,
        name: context.getters.NAME,
        color_id: context.rootGetters.COLORS[context.getters.COLOR].id
      } );

      context.rootGetters.ORGANIZATIONS[context.getters.ORIGINAL].name = result.name;
      context.rootGetters.ORGANIZATIONS[context.getters.ORIGINAL].color_id = result.color_id;

      context.rootGetters['ORGANIZATIONS'].sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0
      } );
      
      for( let c = 0; c < context.rootGetters['ORGANIZATIONS'].length; c++ ) {
        if( context.rootGetters['ORGANIZATIONS'][c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }            
    }
  }
}
