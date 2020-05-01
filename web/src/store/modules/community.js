import activity from './activity.js';
import social from './social.js';
import notes from './notes.js';

import Contribution from '../../rpc/contribution.js';
import Member from '../../rpc/member.js';
import Note from '../../rpc/note.js';

export default {
  namespaced: true,
  state: {
    members: [],
    original: null,
    selected: {
      id: null,
      name: null,
      email: null,
      title: null,
      location: null,
      organizations: [],
      relationships: [],
      description: null,
      internal: null,
      public: 1,
      roles: [],
      languages: [],
      skills: []
    }
  },
  getters: {
    DESCRIPTION: function( state ) {
      return state.selected === null ? null : state.selected.description;
    },
    EMAIL: function( state ) {
      return state.selected == null ? null : state.selected.email;
    },
    INITIALS: function( state ) {
      if( state.selected === null ) {
        return null;
      }

      if( state.selected.name === null ) {
        return null;
      }

      let cleaned = state.selected.name.replace( /\([^()]*\)/g, '' );
      let parts = cleaned.split( ' ' );
      let result = '';

      for( let p = 0; p < parts.length; p++ ) {
        let name = parts[p].trim();

        if( name.length === 0 ) {
          continue;
        }

        let letter = name.charAt( 0 );

        if( name.indexOf( '-' ) > -1 ) {
          let hyphens = name.split( '-' );

          for( let h = 1; h < hyphens.length; h++ ) {
            letter = letter + hyphens[h].charAt( 0 );
          }
        }

        result = result + letter;
      }

      return result.toUpperCase();
    },
    INTERNAL: function( state ) {
      return state.selected == null ? null : state.selected.internal;      
    },
    LANGUAGES: function( state ) {
      return state.selected == null ? null : state.selected.languages;
    },        
    LOCATION: function( state ) {
      return state.selected === null ? null : state.selected.location;
    },
    MEMBER_ID: function( state ) {
      return state.selected == null ? null : state.selected.id;
    },    
    MEMBERS: ( state ) => ( search ) => {
      if( search === null ) {
        search = '';
      } else {
        search = search.toLowerCase();
      }

      return state.members.filter( function( record ) {
        if( record.name.toLowerCase().indexOf( search ) >= 0 ) {
          return record;
        }
      } );
    },    
    ORGANIZATIONS: function( state ) {
      return state.selected == null ? null : state.selected.organizations;
    },    
    ORIGINAL: function( state ) {
      return state.original;
    },
    NAME: function( state ) {
      return state.selected == null ? null : state.selected.name;
    },
    PUBLIC: function( state ) {
      return state.selected.public;
    },    
    RELATIONSHIPS: function( state ) {
      return state.selected == null ? null : state.selected.relationships;
    },
    ROLES: function( state ) {
      return state.selected == null ? null : state.selected.roles;
    },        
    SELECTED: function( state ) {
      return state.selected === null ? null : state.selected;
    },
    SITUATIONS: function( state ) {
      return state.situations;
    },
    SKILLS: function( state ) {
      return state.selected == null ? null : state.selected.skills;
    },        
    TITLE: function( state ) {
      return state.selected == null ? null : state.selected.title;      
    }
  },
  mutations: {
    ADD_MEMBER: function( state, member ) {
      state.members.push( member );
      state.members.sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0;
      } );
    },
    REMOVE_MEMBER: function( state, id ) {
      let index = null;

      for( let m = 0; m < state.members.length; m++ ) {
        if( state.members[m].id === id ) {
          index = m;
          break;
        }
      }

      state.members.splice( index, 1 );
    },
    SET_DESCRIPTION: function( state, description ) {
      state.selected.description = description;
    },
    SET_EMAIL: function( state, email ) {
      state.selected.email = email;      
    },
    SET_ID: function( state, id ) {
      state.selected.id = id;      
    },    
    SET_INTERNAL: function( state, internal ) {
      state.selected.internal = internal;      
    },
    SET_LANGUAGES: function( state, languages ) {
      state.selected.languages = languages;
    },    
    SET_LOCATION: function( state, location ) {
      state.selected.location = location;      
    },
    SET_MEMBER: function( state, member ) {
      let index = null;

      for( let m = 0; m < state.members.length; m++ ) {
        if( state.members[m].id === member.id ) {
          index = m;
          break;
        }
      }

      state.members.splice( index, 1, member );
      state.members.sort( ( a, b ) => {
        if( a.name > b.name ) return 1;
        if( a.name < b.name ) return -1;
        return 0;
      } );      
    },
    SET_MEMBERS: function( state, members ) {
      state.members = members;
    },
    SET_NAME: function( state, name ) {
      state.selected.name = name;      
    },
    SET_ORGANIZATIONS: function( state, organizations ) {
      state.selected.organizations = organizations;
    },
    SET_ORIGINAL: function( state, original ) {
      state.original = original;
    },
    SET_PUBLIC: function( state, value ) {
      state.selected.public = value;
    },
    SET_RELATIONSHIPS: function( state, relationships ) {
      state.selected.relationships = relationships;
    },
    SET_ROLES: function( state, roles ) {
      state.selected.roles = roles;
    },    
    SET_SELECTED: function( state, member ) {
      state.selected = member;
    },
    SET_SKILLS: function( state, skills ) {
      state.selected.skils = skills;
    },    
    SET_TITLE: function( state, title ) {
      state.selected.title = title;      
    }    
  },
  actions: {    
    CLEAR_SELECTED: function( context ) {
      context.commit( 'SET_ID', null );
      context.commit( 'SET_NAME', null );
      context.commit( 'SET_EMAIL', null );      
      context.commit( 'SET_TITLE', null );      
      context.commit( 'SET_LOCATION', null );      
      context.commit( 'SET_ORGANIZATIONS', [] );      
      context.commit( 'SET_RELATIONSHIPS', [] );      
      context.commit( 'SET_DESCRIPTION', null );
      context.commit( 'SET_INTERNAL', null );
      context.commit( 'SET_ROLES', [] );
      context.commit( 'SET_LANGUAGES', [] );
      context.commit( 'SET_SKILLS', [] ); 
    },
    COPY_SELECTED: function( context ) {
      context.commit( 
        'SET_ORIGINAL', 
        JSON.parse( JSON.stringify( context.getters.SELECTED ) ) 
      );
    },
    CREATE_MEMBER: async function( context ) {
      let email = context.getters.EMAIL;
      let name = context.getters.NAME;
      let title = context.getters.TITLE;
      let description = context.getters.DESCRIPTION;
      let location = context.getters.LOCATION;
      let internal = context.getters.INTERNAL;

      if( name !== null ) {
        if( name.trim().length === 0 ) {
          name = null;
        }
      }

      if( email !== null ) {
        if( email.trim().length === 0 ) {
          email = null;
        }
      }      

      if( title !== null ) {
        if( title.trim().length === 0 ) {
          title = null;
        }
      }            

      if( description !== null ) {
        if( description.trim().length === 0 ) {
          description = null;
        }
      }                
      
      if( location !== null ) {
        if( location.trim().length === 0 ) {
          location = null;
        }
      }                     
      
      if( internal !== null ) {
        if( internal.trim().length === 0 ) {
          internal = null;
        }
      }                           
      
      let member = await Member.create( context.rootGetters.TOKEN, {
        name: name,
        email: email,
        title: title,
        description: description,
        image: null,
        location: location,
        latitude: null,
        longitude: null,
        address: null,
        city: null,
        region: null,
        postal: null,        
        country: null,
        public: context.getters.PUBLIC,
        internal: internal
      } );

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        member.id,
        'language',
        context.getters.LANGUAGES
      );

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        member.id, 
        'organization',
        context.getters.ORGANIZATIONS
      );

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        member.id,
        'relationship',
        context.getters.RELATIONSHIPS
      );
      
      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        member.id,
        'role',
        context.getters.ROLES
      );      

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        member.id,
        'skill',
        context.getters.SKILLS
      );      

      context.commit( 'ADD_MEMBER', member );
      context.dispatch( 'READ_MEMBER', member.id );      
    },
    LOAD: async function( context ) {
      let members = await Member.browse( context.rootGetters.TOKEN );
      context.commit( 'SET_MEMBERS', members );
    },    
    READ_MEMBER: async function( context, id ) {
      let member = await Member.read( context.rootGetters.TOKEN, id );
      context.commit( 'SET_SELECTED', member );      

      let social = await Member.social( context.rootGetters.TOKEN, id );
      context.dispatch( 'social/SET_SOCIAL', social );

      let contributions = await Contribution.browse( context.rootGetters.TOKEN, id );
      context.dispatch( 'activity/SET_CONTRIBUTIONS', contributions );

      let notes = await Note.browse( context.rootGetters.TOKEN, id );
      context.dispatch( 'notes/SET_NOTES', notes );      
    },
    REMOVE_MEMBER: async function( context, id ) {
      await Member.remove( context.rootGetters.TOKEN, id );
      context.commit( 'REMOVE_MEMBER', id );
    },    
    RESTORE_ORIGINAL: function( context ) {
      context.commit( 
        'SET_SELECTED', 
        JSON.parse( JSON.stringify( context.getters.ORIGINAL ) ) 
      );
      context.commit( 'SET_ORIGINAL', null );
    },    
    SET_DESCRIPTION: function( context, description ) {
      context.commit( 'SET_DESCRIPTION', description );
    },        
    SET_EMAIL: function( context, email ) {
      context.commit( 'SET_EMAIL', email );
    },    
    SET_INTERNAL: function( context, internal ) {
      context.commit( 'SET_INTERNAL', internal );
    },            
    SET_LANGUAGES: function( context, languages ) {
      context.commit( 'SET_LANGUAGES', languages );
    },    
    SET_LOCATION: function( context, location ) {
      context.commit( 'SET_LOCATION', location );
    },                
    SET_NAME: function( context, name ) {
      context.commit( 'SET_NAME', name );
    },
    SET_ORGANIZATIONS: function( context, organizations ) {
      context.commit( 'SET_ORGANIZATIONS', organizations );
    },
    SET_PUBLIC: function( context, value ) {
      context.commit( 'SET_PUBLIC', value );
    },
    SET_RELATIONSHIPS: function( context, relationships ) {
      context.commit( 'SET_RELATIONSHIPS', relationships );
    },
    SET_ROLES: function( context, roles ) {
      context.commit( 'SET_ROLES', roles );
    },     
    SET_SKILLS: function( context, skills ) {
      context.commit( 'SET_SKILLS', skills );
    },    
    SET_TITLE: function( context, title ) {
      context.commit( 'SET_TITLE', title );
    },  
    UNLOAD: function( context ) {
      context.commit( 'SET_MEMBERS', [] );
      context.commit( 'SET_SELECTED', null );      
    },
    UPDATE_MEMBER: async function( context ) {
      let email = context.getters.EMAIL;
      let name = context.getters.NAME;
      let title = context.getters.TITLE;
      let description = context.getters.DESCRIPTION;
      let location = context.getters.LOCATION;
      let internal = context.getters.INTERNAL;

      if( name !== null ) {
        if( name.trim().length === 0 ) {
          name = null;
        }
      }

      if( email !== null ) {
        if( email.trim().length === 0 ) {
          email = null;
        }
      }      

      if( title !== null ) {
        if( title.trim().length === 0 ) {
          title = null;
        }
      }            

      if( description !== null ) {
        if( description.trim().length === 0 ) {
          description = null;
        }
      }                
      
      if( location !== null ) {
        if( location.trim().length === 0 ) {
          location = null;
        }
      }                     
      
      if( internal !== null ) {
        if( internal.trim().length === 0 ) {
          internal = null;
        }
      }                           

      let member = await Member.update( context.rootGetters.TOKEN, {
        id: context.getters.MEMBER_ID,
        name: name,
        email: email,
        title: title,
        description: description,
        image: null,
        location: location,
        latitude: null,
        longitude: null,
        address: null,
        city: null,
        region: null,
        postal: null,
        country: null,
        public: context.getters.PUBLIC,
        internal: internal
      } );      

      context.commit( 'SET_MEMBER', member ); 

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        context.getters.MEMBER_ID, 
        'language',
        context.getters.LANGUAGES
      );

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        context.getters.MEMBER_ID, 
        'organization',
        context.getters.ORGANIZATIONS
      );

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        context.getters.MEMBER_ID, 
        'relationship',
        context.getters.RELATIONSHIPS
      );           

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        context.getters.MEMBER_ID, 
        'role',
        context.getters.ROLES
      );      

      await Member.modelUpdate( 
        context.rootGetters.TOKEN, 
        context.getters.MEMBER_ID, 
        'skill',
        context.getters.SKILLS
      );      
    }
  },
  modules: {
    activity,
    notes,
    social
  }
}
