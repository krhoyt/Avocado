import Vue from 'vue';
import Vuex from 'vuex';

import community from './modules/community.js';
import picklist from './modules/picklist.js';

Vue.use( Vuex );

import Capacity from '../rpc/capacity.js';
import Color from '../rpc/color.js';
import Language from '../rpc/language.js';
import Organization from '../rpc/organization.js';
import Relationship from '../rpc/relationship.js';
import Reports from '../rpc/reports.js';
import Role from '../rpc/role.js';
import Situation from '../rpc/situation.js';
import Skill from '../rpc/skill.js';

export default new Vuex.Store( {
  state: {
    account: {
      id: null,
      email: null,
      owner: null,
      role: null,
      token: null
    },    
    capacities: [],
    colors: [],
    languages: [],
    organizations: [],
    relationships: [],
    report: [],
    roles: [],
    situations: [],
    skills: [],
    yesno: [
      {label: 'Yes', value: 1},
      {label: 'No', value: 0}
    ]
  },
  getters: {
    ACCOUNT: function( state ) {
      return state.account.id;
    },
    CAPACITIES: function( state ) {
      return state.capacities;
    },
    COLORS: function( state ) {
      return state.colors;
    },
    LANGUAGES: function( state ) {
      return state.languages;
    },    
    ORGANIZATIONS: function( state ) {
      return state.organizations;
    },
    RELATIONSHIPS: function( state ) {
      return state.relationships;
    },
    REPORT: function( state ) {
      return state.report;
    },    
    ROLES: function( state ) {
      return state.roles;
    },    
    SITUATIONS: function( state ) {
      return state.situations;
    },
    SKILLS: function( state ) {
      return state.skills;
    },    
    TOKEN: function( state ) {
      return state.account.token;
    },
    YESNO: function( state ) {
      return state.yesno;
    }
  },
  mutations: {    
    SET_ACCOUNT: function( state, account ) {
      state.account = account;
    },
    SET_CAPACITIES: function( state, capacities ) {
      state.capacities = capacities;
    },    
    SET_COLORS: function( state, colors ) {
      state.colors = colors;
    },
    SET_LANGUAGES: function( state, languages ) {
      state.languages = languages;
    },    
    SET_ORGANIZATIONS: function( state, organizations ) {
      state.organizations = organizations;
    },    
    SET_RELATIONSHIPS: function( state, relationships ) {
      state.relationships = relationships;
    },
    SET_REPORT: function( state, report ) {
      state.report = report;
    },
    SET_ROLES: function( state, roles ) {
      state.roles = roles;
    },
    SET_SITUATIONS: function( state, situations ) {
      state.situations = situations;
    },
    SET_SKILLS: function( state, skills ) {
      state.skills = skills;
    }    
  },
  actions: {
    LOAD: async function( context ) {
      let languages = await Language.browse( context.getters.TOKEN );
      context.commit( 'SET_LANGUAGES', languages );                  

      let organizations = await Organization.browse( context.getters.TOKEN );
      context.commit( 'SET_ORGANIZATIONS', organizations );      

      let relationships = await Relationship.browse( context.getters.TOKEN );
      context.commit( 'SET_RELATIONSHIPS', relationships );                  

      let roles = await Role.browse( context.getters.TOKEN );
      context.commit( 'SET_ROLES', roles );                  
      
      let skills = await Skill.browse( context.getters.TOKEN );
      context.commit( 'SET_SKILLS', skills );                        

      let capacities = await Capacity.browse( context.getters.TOKEN );
      context.commit( 'SET_CAPACITIES', capacities );

      let situations = await Situation.browse( context.getters.TOKEN );
      context.commit( 'SET_SITUATIONS', situations );

      let colors = await Color.browse( context.getters.TOKEN );
      context.commit( 'SET_COLORS', colors );

      let report = await Reports.orbit( context.getters.TOKEN );
      context.commit( 'SET_REPORT', report );      
    },
    SET_ACCOUNT: function( context, account ) {
      context.commit( 'SET_ACCOUNT', account );
    },
    SET_CAPACITIES: function( context, capacities ) {
      context.commit( 'SET_CAPACITIES', capacities );
    },
    SET_COLOR: function( context, colors ) {
      context.commit( 'SET_COLOR', colors );
    },
    UNLOAD: function( context ) {
      context.commit( 'SET_ACCOUNT', {
        id: null,
        email: null,
        owner: null,        
        role: null,
        token: null
      } );

      context.commit( 'SET_CAPACITIES', [] );
      context.commit( 'SET_COLORS', [] );
      context.commit( 'SET_LANGUAGES', [] );
      context.commit( 'SET_ORGANIZATIONS', [] );
      context.commit( 'SET_RELATIONSHIPS', [] );
      context.commit( 'SET_REPORT', [] );
      context.commit( 'SET_ROLES', [] );
      context.commit( 'SET_SITUATIONS', [] );      
      context.commit( 'SET_SKILLS', [] );    
      
      context.dispatch( 'community/UNLOAD' );
    }
  },
  modules: {
    community: community,
    picklist: picklist
  }
} );
