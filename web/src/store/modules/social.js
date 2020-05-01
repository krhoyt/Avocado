export default {
  namespaced: true,
  state: {
    channel: 0,
    channels: [
      {label: 'Blog', value: 'RSS or ATOM, including HTTP/S', entity: 'blog', field: 'url', url: null},
      {label: 'Dev.to', value: 'User name, after trailing slash of profile', entity: 'dev', field: 'user_name', url: 'https://dev.to/'},
      {label: 'GitHub', value: 'User name, after trailing slash', entity: 'github', field: 'login', url: 'https://github.com/'},  
      {label: 'Instagram', value: 'Profile name, not actual name', entity: 'instagram', field: 'profile', url: 'https://www.instagram.com/'},  
      {label: 'LinkedIn', value: 'Profile name, after "in"', entity: 'linkedin', field: 'profile', url: 'https://www.linkedin.com/in/'}, 
      {label: 'Medium', value: 'User name, after the "@" symbol', entity: 'medium', field: 'user_name', url: 'https://medium.com/@'},
      {label: 'Reddit', value: 'User name, as shown in posts', entity: 'reddit', field: 'name', url: 'https://www.reddit.com/user/'},  
      {label: 'Stack Overflow', value: 'User ID, not user name', entity: 'so', field: 'user', url: 'https://stackoverflow.com/users/'},  
      {label: 'Twitter', value: 'User name, no "@" symbol', entity: 'twitter', field: 'screen_name', url: 'https://twitter.com/'},  
      {label: 'Website', value: 'Including HTTP/S', entity: 'website', field: 'url', url: null},  
      {label: 'YouTube', value: 'Channel ID, not user name', entity: 'youtube', field: 'channel', url: 'https://www.youtube.com/channel/'}
    ],
    original: null,
    selected: {
      id: null,
      channel: 'Blog',
      endpoint: null,
      entity: 'blog'
    },
    social: [],    
  },
  getters: {
    CHANNEL: function( state ) {
      return state.channel;
    },
    CHANNELS: function( state ) {
      return state.channels;
    },
    ENDPOINT: function( state ) {
      return state.selected.endpoint;
    },
    ID: function( state ) {
      return state.selected.id;
    },
    ORIGINAL: function( state ) {
      return state.original;
    },
    SELECTED: function( state ) {
      return state.selected;
    },
    SOCIAL: function( state ) {
      return state.social;
    }
  },
  mutations: {
    ADD_CHANNEL: function( state, channel ) {
      state.social.push( channel );
      state.social.sort( ( a, b ) => {
        if( a.channel > b.channel ) return 1;
        if( a.channel < b.channel ) return -1;
        return 0;
      } );
    },    
    REMOVE_CHANNEL: function( state, id ) {
      let index = null;

      for( let s = 0; s < state.social.length; s++ ) {
        if( state.social[s].id === id ) {
          index = s;
          break;
        }
      }

      state.social.splice( index, 1 );
    },    
    SET_CHANNEL: function( state, channel ) {
      state.channel = channel;
    },
    SET_ENDPOINT: function( state, endpoint ) {
      state.selected.endpoint = endpoint;
    },
    SET_ORIGINAL: function( state, original ) {
      state.original = original;
    },
    SET_SELECTED: function( state, selected ) {
      state.selected = selected;
    },
    SET_SOCIAL: function( state, social ) {
      state.social = social;
    }
  },
  actions: {
    CHANGE: function( context, index ) {
      context.commit( 'SET_SELECTED', context.getters.SOCIAL[index] );

      for( let c = 0; c < context.getters.CHANNELS.length; c++ ) {
        if( context.getters.CHANNELS[c].label === context.getters.SELECTED.channel ) {
          context.commit( 'SET_CHANNEL', c ); 
          break;
        }
      }      
    },
    CLEAR_SELECTED: function( context ) {
      context.commit( 'SET_SELECTED', {
        id: null,
        endpoint: null
      } );
    },
    COPY_SELECTED: function( context ) {
      context.commit( 'SET_ORIGINAL', context.getters.ENDPOINT );
    },
    CREATE_CHANNEL: async function( context ) {
      let record = {developer_id: context.rootGetters['community/MEMBER_ID']};
      record[context.getters.CHANNELS[context.getters.CHANNEL].field] = context.getters.ENDPOINT;

      let result = await fetch( `${process.env.VUE_APP_API}/${context.getters.CHANNELS[context.getters.CHANNEL].entity}`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'X-Avocado': context.rootGetters.TOKEN
        },
        body: JSON.stringify( record )
      } )
      .then( ( response ) => response.json() )

      let channel = {
        id: result.id,
        channel: context.getters.CHANNELS[context.getters.CHANNEL].label,
        endpoint: context.getters.ENDPOINT,
        developer_id: result.developer_id,
        entity: context.getters.CHANNELS[context.getters.CHANNEL].entity
      }

      context.commit( 'ADD_CHANNEL', channel );
      context.commit( 'SET_SELECTED', channel );
    },
    REMOVE_CHANNEL: function( context, id ) {
      fetch( `${process.env.VUE_APP_API}/${context.getters.CHANNELS[context.getters.CHANNEL].entity}/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Avocado': context.rootGetters.TOKEN
        }
      } );
      context.commit( 'REMOVE_CHANNEL', id );
    },        
    RESTORE_ORIGINAL: function( context ) {
      context.commit( 'SET_ENDPOINT', context.getters.ORIGINAL );
      context.commit( 'SET_ORIGINAL', null );
    },
    SET_CHANNEL: function( context, channel ) {
      context.commit( 'SET_CHANNEL', channel );
    },
    SET_ENDPOINT: function( context, endpoint ) {
      context.commit( 'SET_ENDPOINT', endpoint );
    },
    SET_SELECTED: function( context, selected ) {
      context.commit( 'SET_SELECTED', selected );
    },
    SET_SOCIAL: function( context, endpoints ) {
      context.commit( 'SET_SOCIAL', endpoints );
      context.dispatch( 'CLEAR_SELECTED' );
    },
    UPDATE_CHANNEL: async function( context ) {
      let entity = context.getters.CHANNELS[context.getters.CHANNEL].entity;

      let record = {};
      record[context.getters.CHANNELS[context.getters.CHANNEL].field] = context.getters.ENDPOINT;

      await fetch( `${process.env.VUE_APP_API}/${entity}/${context.getters.ID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Avocado': context.rootGetters.TOKEN
        },
        body: JSON.stringify( record )
      } )
      .then( ( response ) => response.json() );
    }
  }
}
