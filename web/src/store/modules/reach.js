import Reach from '../../rpc/reach.js';

export default {
  namespaced: true,
  state: {
    elements: [],
    id: null,
    account_id: null,
    name: null,
    color: 0,
    color_id: null,
    weight: 0,
    criteria: null,
    count: 0,
    original: 0,
    conditions: [
      {label: 'Contains'},        
      {label: 'Exists'},
      {label: 'Equals'},
      {label: 'Is Not Equal'},
      {label: 'Greater Than'},
      {label: 'Less Than'},
      {label: 'Greater Than or Equal'},        
      {label: 'Less Than or Equal'}
    ],    
    entities: [
      {label: 'Blog Post'},
      {label: 'Dev.to Post'},
      {label: 'GitHub Account'},
      {label: 'GitHub Event'},
      {label: 'Medium Account'},      
      {label: 'Medium Post'},
      {label: 'Stack Overflow Account'},                  
      {label: 'Stack Overflow Answer'},            
      {label: 'Twitter Account'},
      {label: 'Twitter Status'},
      {label: 'YouTube Video'}
    ],
    fields: {
      'Blog Post': [
        {label: 'Post'}
      ],
      'Dev.to Post': [
        {label: 'Likes'},
        {label: 'Post'},        
        {label: 'Reading'},
        {label: 'Unicorn'}        
      ],
      'GitHub Account': [
        {label: 'Followers'},
        {label: 'Following'},        
        {label: 'Gists'},
        {label: 'Repositories'}
      ],
      'GitHub Event': [
        {label: 'Event'}
      ],
      'Medium Account': [
        {label: 'Followed By'},        
        {label: 'Following'}
      ],
      'Medium Post': [
        {label: 'Claps'},        
        {label: 'Post'}
      ],
      'Stack Overflow Account': [
        {label: 'Accept Rate'},
        {label: 'Reputation'}
      ],
      'Stack Overflow Answer': [
        {label: 'Answer'},
        {label: 'Score'},
        {label: 'Views'}
      ],
      'Twitter Account': [
        {label: 'Favorites'},
        {label: 'Followers'},
        {label: 'Friends'},
        {label: 'Status Count'}
      ],
      'Twitter Status': [
        {label: 'Favorite'},
        {label: 'Retweet'},
        {label: 'Status'}
      ],
      'YouTube Video': [
        {label: 'Stars'},        
        {label: 'Video'},
        {label: 'Views'}
      ]
    },
    operators: [
      {label: 'And'},
      {label: 'Or'}
    ]  
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
    CONDITIONS: function( state ) {
      return state.conditions;
    },
    COUNT: function( state ) {
      return state.count;
    },
    CRITERIA: function( state ) {
      return state.criteria;
    },
    ELEMENTS: function( state ) {
      return state.elements;
    },    
    ENTITIES: function( state ) {
      return state.entities;
    },
    FIELDS: function( state ) {
      return state.fields;
    },
    ID: function( state ) {
      return state.id;
    },
    NAME: function( state ) {
      return state.name;
    },
    OPERATORS: function( state ) {
      return state.operators;
    },
    ORIGINAL: function( state ) {
      return state.original;
    },
    WEIGHT: function( state ) {
      return state.weight;
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
    SET_CRITERIA: function( state, criteria ) {
      state.criteria = criteria;
    },
    SET_ELEMENTS: function( state, elements ) {
      state.elements = elements;
    },
    SET_NAME: function( state, name ) {
      state.name = name;
    },
    SET_ORIGINAL: function( state, original ) {
      state.original = original;
    },
    SET_WEIGHT: function( state, weight ) {
      state.weight = weight;
    }
  },
  actions: {
    CREATE_ELEMENT: async function( context ) {
      let result = await Reach.create( context.rootGetters.TOKEN, {
        name: context.getters.NAME,
        color_id: context.rootGetters.COLORS[context.getters.COLOR].id,
        weight: context.getters.WEIGHT,
        criteria: context.getters.CRITERIA
      } );
      result.color = context.getters.COLOR;

      context.getters.ELEMENTS.push( result );
      context.getters.ELEMENTS.sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0
      } );      

      for( let c = 0; c < context.getters.ELEMENTS.length; c++ ) {
        if( context.getters.ELEMENTS[c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }      
    },
    LOAD: async function( context ) {
      let elements = await Reach.browse( context.rootGetters.TOKEN );
      context.commit( 'SET_ELEMENTS', elements );
    },
    REMOVE_ELEMENT: function( context, id ) {
      Reach.remove( context.rootGetters.TOKEN, id );
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
    SET_CRITERIA: function( context, criteria ) {
      if( criteria === null ) {
        context.commit( 'SET_CRITERIA', criteria );
      } else {
        context.commit( 'SET_CRITERIA', criteria.toString() );
      }
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
    SET_WEIGHT: function( context, weight ) {
      context.commit( 'SET_WEIGHT', weight );
    },
    UNLOAD: function( context ) {
      context.commit( 'SET_ELEMENTS', [] );
    },
    UPDATE_ELEMENT: async function( context ) {
      let result = await Reach.update( context.rootGetters.TOKEN, {
        id: context.getters.ID,
        name: context.getters.NAME,
        color_id: context.rootGetters.COLORS[context.getters.COLOR].id,
        weight: context.getters.WEIGHT,
        criteria: context.getters.CRITERIA
      } );

      context.getters.ELEMENTS[context.getters.ORIGINAL].name = result.name;
      context.getters.ELEMENTS[context.getters.ORIGINAL].color_id = result.color_id;
      context.getters.ELEMENTS[context.getters.ORIGINAL].weight = result.weight;
      context.getters.ELEMENTS[context.getters.ORIGINAL].criteria = result.criteria;

      context.getters.ELEMENTS.sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0
      } );
      
      for( let c = 0; c < context.getters.ELEMENTS.length; c++ ) {
        if( context.getters.ELEMENTS[c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }            
    }
  }
}
