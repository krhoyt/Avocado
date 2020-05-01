import Note from '../../rpc/note.js';

export default {
  namespaced: true,
  state: {
    situation: 0,
    noted: null,
    original: null,
    selected: {
      id: null,
      full_text: null
    },
    notes: [],    
  },
  getters: {
    DESCRIPTION: function( state ) {
      return state.selected.full_text;
    },
    ORIGINAL: function( state ) {
      return state.original;
    },
    NOTED: function( state ) {
      if( state.noted === null ) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String( today.getMonth() + 1 ).padStart( 2, '0' );
        const date = String( today.getDate() ).padStart( 2, '0' );
    
        state.noted = `${year}-${month}-${date}`;        
      }

      return state.noted;
    },
    NOTES: function( state ) {
      return state.notes;
    },
    SELECTED: function( state ) {
      return state.selected;
    },
    SITUATION: function( state ) {
      return state.situation;
    }
  },
  mutations: {
    REMOVE_NOTE: function( state ) {
      let index = null;

      for( let n = 0; n < state.notes.length; n++ ) {
        if( state.notes[n].id === state.selected.id ) {
          index = n;
          break;
        }
      }

      state.notes.splice( index, 1 );
    },    
    SET_DESCRIPTION: function( state, description ) {
      state.selected.full_text = description;
    },
    SET_NOTED: function( state, noted ) {
      state.noted = noted;
    },
    SET_NOTES: function( state, notes ) {
      state.notes = notes;
    },
    SET_ORIGINAL: function( state, original ) {
      state.original = original;
    },
    SET_SELECTED: function( state, selected ) {
      state.selected = selected;
    },
    SET_SITUATION: function( state, situation ) {
      state.situation = situation;
    }
  },
  actions: {
    CLEAR_SELECTED: function( context ) {
      context.commit( 'SET_SELECTED', {
        id: null,
        full_text: null
      } );
    },
    COPY_SELECTED: function( context ) {
      context.commit( 
        'SET_ORIGINAL', 
        JSON.parse( JSON.stringify( context.getters.SELECTED ) ) 
      );
    },
    CREATE_NOTE: async function( context ) {
      let result = await Note.create( context.rootGetters.TOKEN, {
        developer_id: context.rootGetters['community/MEMBER_ID'],
        noted_at: new Date( context.getters.NOTED ),
        full_text: context.getters.DESCRIPTION,
        situation_id: context.rootGetters.SITUATIONS[context.getters.SITUATION].id
      } );

      context.getters.NOTES.push( result );
      context.getters.NOTES.sort( ( a, b ) => {
        a = new Date( a.noted_at );
        b = new Date( b.noted_at );

        if( a.getTime() > b.getTime() ) return -1;
        if( a.getTime() < b.getTime() ) return 1;
        return 0;
      } );

      context.dispatch( 'SET_SELECTED', result );
    },    
    REMOVE_NOTE: function( context ) {
      context.commit( 'REMOVE_NOTE' );

      Note.remove( context.rootGetters.TOKEN, context.getters.SELECTED.id );      
      context.dispatch( 'CLEAR_SELECTED' );
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
    SET_NOTED: function( context, noted ) {
      context.commit( 'SET_NOTED', noted );
    },
    SET_NOTES: function( context, notes ) {
      context.commit( 'SET_NOTES', notes );
    },
    SET_SELECTED: function( context, selected ) {
      context.commit( 'SET_SELECTED', selected );
    },
    SET_SITUATION: function( context, situation ) {
      context.commit( 'SET_SITUATION', situation );
    },
    UPDATE_NOTE: function( context ) {
      Note.update( context.rootGetters.TOKEN, {
        id: context.getters.SELECTED.id,
        developer_id: context.rootGetters['community/MEMBER_ID'],
        noted_at: new Date( context.getters.NOTED ),
        full_text: context.getters.DESCRIPTION,
        situation_id: context.rootGetters.SITUATIONS[context.getters.SITUATION].id
      } );

      context.getters.NOTES.sort( ( a, b ) => {
        a = new Date( a.noted_at );
        b = new Date( b.noted_at );

        if( a.getTime() > b.getTime() ) return -1;
        if( a.getTime() < b.getTime() ) return 1;
        return 0;
      } );
    }    
  }
}
