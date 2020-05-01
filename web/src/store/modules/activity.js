import Contribution from '../../rpc/contribution.js';

export default {
  namespaced: true,
  state: {
    capacity: 0,
    contributed: null,
    original: null,
    selected: {
      id: null,
      contributed_at: null,
      capacity: 0,
      link: null,
      description: null,
      public: 1
    },
    contributions: [],    
  },
  getters: {
    CAPACITY: function( state ) {
      return state.capacity;
    },
    CONTRIBUTIONS: function( state ) {
      return state.contributions;
    },
    CONTRIBUTED: function( state ) {
      if( state.contributed === null ) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String( today.getMonth() + 1 ).padStart( 2, '0' );
        const date = String( today.getDate() ).padStart( 2, '0' );
    
        state.contributed = `${year}-${month}-${date}`;        
      }

      return state.contributed;
    },
    DESCRIPTION: function( state ) {
      let result = state.selected.description;

      if( result !== null ) {
        if( result.trim().length === 0 ) {
          result = null;
        }
      }
      
      return result;
    },
    LINK: function( state ) {
      let result = state.selected.link;

      if( result !== null ) {
        if( result.trim().length === 0 ) {
          result = null;
        }
      }
      
      return result;
    },
    ORIGINAL: function( state ) {
      return state.original;
    },
    PUBLIC: function( state ) {
      return state.selected.public;
    },
    SELECTED: function( state ) {
      return state.selected;
    }
  },
  mutations: {
    REMOVE_CONTRIBUTION: function( state ) {
      let index = null;

      for( let c = 0; c < state.contributions.length; c++ ) {
        if( state.contributions[c].id === state.selected.id ) {
          index = c;
          break;
        }
      }

      state.contributions.splice( index, 1 );
    },
    SET_CAPACITY: function( state, capacity ) {
      state.capacity = capacity;
    },
    SET_CONTRIBUTED: function( state, contributed ) {
      state.contributed = contributed;
    },
    SET_CONTRIBUTIONS: function( state, contributions ) {
      state.contributions = contributions;
    },
    SET_ORIGINAL: function( state, original ) {
      state.original = original;
    },
    SET_PUBLIC: function( state, publish ) {
      state.selected.public = publish;
    },
    SET_ROLES: function( state, roles ) {
      state.selected.roles = roles;
    },
    SET_SELECTED: function( state, selected ) {
      state.selected = selected;
    }
  },
  actions: {
    CLEAR_SELECTED: function( context ) {
      context.commit( 'SET_SELECTED', {
        id: null,
        link: null,
        description: null,
        public: context.getters.PUBLIC,
        roles: []
      } );
    },
    COPY_SELECTED: function( context ) {
      context.commit( 
        'SET_ORIGINAL', 
        JSON.parse( JSON.stringify( context.getters.SELECTED ) ) 
      );
    },
    CREATE_CONTRIBUTION: async function( context ) {
      let result = await Contribution.create( context.rootGetters.TOKEN, {
        developer_id: context.rootGetters['community/MEMBER_ID'],
        contributed_at: new Date( context.getters.CONTRIBUTED ),
        description: context.getters.DESCRIPTION,
        link: context.getters.LINK,
        public: context.getters.PUBLIC,
        capacity_id: context.rootGetters.CAPACITIES[context.getters.CAPACITY].id
      } );

      let roles = await Contribution.updateRoles( 
        context.rootGetters.TOKEN, 
        result.id, 
        context.getters.SELECTED.roles 
      );

      context.getters.CONTRIBUTIONS.push( result );
      context.getters.CONTRIBUTIONS.sort( ( a, b ) => {
        a = new Date( a.contributed_at );
        b = new Date( b.contributed_at );

        if( a.getTime() > b.getTime() ) return -1;
        if( a.getTime() < b.getTime() ) return 1;
        return 0;
      } );

      context.dispatch( 'SET_SELECTED', result );
      context.dispatch( 'SET_ROLES', roles );
    },
    REMOVE_CONTRIBUTION: async function( context ) {
      context.commit( 'REMOVE_CONTRIBUTION' );

      await Contribution.removeRoles( context.rootGetters.TOKEN, context.getters.SELECTED.id );

      Contribution.remove( context.rootGetters.TOKEN, context.getters.SELECTED.id );      
      context.dispatch( 'CLEAR_SELECTED' );
    },
    RESTORE_ORIGINAL: function( context ) {
      context.commit( 
        'SET_SELECTED', 
        JSON.parse( JSON.stringify( context.getters.ORIGINAL ) ) 
      );
      context.commit( 'SET_ORIGINAL', null );
    },            
    SET_CAPACITY: function( context, capacity ) {
      context.commit( 'SET_CAPACITY', capacity );
    },
    SET_CONTRIBUTED: function( context, contributed ) {
      context.commit( 'SET_CONTRIBUTED', contributed );
    },
    SET_CONTRIBUTIONS: function( context, contributions ) {
      context.commit( 'SET_CONTRIBUTIONS', contributions );
    },
    SET_PUBLIC: function( context, publish ) {
      context.commit( 'SET_PUBLIC', publish );
    },
    SET_ROLES: function( context, roles ) {
      context.commit( 'SET_ROLES', roles );
    },
    SET_SELECTED: function( context, selected ) {
      context.commit( 'SET_SELECTED', selected );
    },
    UPDATE_CONTRIBUTION: function( context ) {
      Contribution.update( context.rootGetters.TOKEN, {
        id: context.getters.SELECTED.id,
        developer_id: context.rootGetters['community/MEMBER_ID'],
        contributed_at: new Date( context.getters.CONTRIBUTED ),
        description: context.getters.DESCRIPTION,
        link: context.getters.LINK,
        public: context.getters.PUBLIC,
        capacity_id: context.rootGetters.CAPACITIES[context.getters.CAPACITY].id
      } );

      Contribution.updateRoles( 
        context.rootGetters.TOKEN, 
        context.getters.SELECTED.id,
        context.getters.SELECTED.roles 
      );

      context.getters.CONTRIBUTIONS.sort( ( a, b ) => {
        a = new Date( a.contributed_at );
        b = new Date( b.contributed_at );

        if( a.getTime() > b.getTime() ) return -1;
        if( a.getTime() < b.getTime() ) return 1;
        return 0;
      } );
    } 
  }
}
