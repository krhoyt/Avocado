import Capacity from '../../rpc/capacity.js';

export default {
  namespaced: true,
  state: {
    capacities: [],
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
      {label: 'Blog'},
      {label: 'Dev.to'},
      {label: 'GitHub'},
      {label: 'Medium'},
      {label: 'Stack Overflow'},
      {label: 'Twitter'},
      {label: 'YouTube'}
    ],
    fields: {
      'Blog': [
        {label: 'Title'},
        {label: 'Summary'},
        {label: 'Category'},
        {label: 'Keyword'}
      ],
      'Dev.to': [
        {label: 'Title'},
        {label: 'Summary'},
        {label: 'Likes'},
        {label: 'Reading'},
        {label: 'Unicorn'},
        {label: 'Keyword'}        
      ],
      'GitHub': [
        {label: 'Event Name'},
        {label: 'Repository Name'},
      ],
      'Medium': [
        {label: 'Title'},
        {label: 'Summary'},
        {label: 'Claps'},
        {label: 'Category'},
        {label: 'Keyword'}        
      ],
      'Stack Overflow': [
        {label: 'Accepted'},
        {label: 'Score'},
        {label: 'Views'},
        {label: 'Title'},
        {label: 'Tags'},
        {label: 'Keywords'}
      ],
      'Twitter': [
        {label: 'Status'},
        {label: 'Favorite'},
        {label: 'Retweet'},
        {label: 'Hashtags'},
        {label: 'Mentions'},
        {label: 'URLs'}
      ],
      'YouTube': [
        {label: 'Title'},
        {label: 'Views'},
        {label: 'Stars'},
        {label: 'Duration (sec)'},
        {label: 'Summary'}
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
    CAPACITIES: function( state ) {
      return state.capacities;
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
    SET_CAPACITIES: function( state, capacities ) {
      state.capacities = capacities;
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
    CREATE_CAPACITY: async function( context ) {
      let result = await Capacity.create( context.rootGetters.TOKEN, {
        name: context.getters.NAME,
        color_id: context.rootGetters.COLORS[context.getters.COLOR].id,
        weight: context.getters.WEIGHT,
        criteria: context.getters.CRITERIA
      } );
      result.count = 0;        
      result.color = context.getters.COLOR;

      context.getters.CAPACITIES.push( result );
      context.getters.CAPACITIES.sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0
      } );      

      for( let c = 0; c < context.getters.CAPACITIES.length; c++ ) {
        if( context.getters.CAPACITIES[c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }      
    },
    LOAD: async function( context ) {
      let capacities = await Capacity.browse( context.rootGetters.TOKEN );
      context.commit( 'SET_CAPACITIES', capacities );
    },
    REMOVE_CAPACITY: function( context, id ) {
      Capacity.remove( context.rootGetters.TOKEN, id );
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
      context.commit( 'SET_CAPACITIES', [] );
    },
    UPDATE_CAPACITY: async function( context ) {
      let result = await Capacity.update( context.rootGetters.TOKEN, {
        id: context.getters.ID,
        name: context.getters.NAME,
        color_id: context.rootGetters.COLORS[context.getters.COLOR].id,
        weight: context.getters.WEIGHT,
        criteria: context.getters.CRITERIA
      } );

      context.getters.CAPACITIES[context.getters.ORIGINAL].name = result.name;
      context.getters.CAPACITIES[context.getters.ORIGINAL].color_id = result.color_id;
      context.getters.CAPACITIES[context.getters.ORIGINAL].weight = result.weight;
      context.getters.CAPACITIES[context.getters.ORIGINAL].criteria = result.criteria;

      context.getters.CAPACITIES.sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0
      } );
      
      for( let c = 0; c < context.getters.CAPACITIES.length; c++ ) {
        if( context.getters.CAPACITIES[c].id === result.id ) {
          context.commit( 'SET_ORIGINAL', c );
          break;
        }
      }            
    }
  }
}
