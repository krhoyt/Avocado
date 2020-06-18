<template>
  <Box
    direction="column"
    :grow="1">

    <Header
      :decorate="account === null ? false : true"
      @logout="logout"
      @menu="menu = !menu"/>

    <Box
      direction="row"
      :grow="1"
      v-show="feature != 'login'">
      <Menu
        @change="feature = $event"/>
      <Members
        v-show="feature === 'members'"/>
      <Report
        v-show="feature === 'reports'"/>        
      <Capacity
        v-show="feature === 'types'"/>
      <Reach
        v-show="feature === 'elements'"/>
      <Level
        v-show="feature === 'levels'"/>        
      <Color
        v-show="feature === 'colors'"/>
      <Language
        v-show="feature === 'languages'"/>
      <Organization
        v-show="feature === 'organizations'"/>
      <Relationship
        v-show="feature === 'relationships'"/>
      <Role
        v-show="feature === 'roles'"/>
      <Situation
        v-show="feature === 'situations'"/>
      <Skill
        v-show="feature === 'skills'"/>
    </Box>

    <Login
      @login="login( $event )"
      v-show="feature === 'login'"/>

  </Box>
</template>

<script>
import Box from './containers/Box.vue';
import Capacity from './manager/rules/Capacity.vue';
import Color from './manager/resources/Color.vue';
import Header from './manager/Header.vue';
import Language from './manager/resources/Language.vue';
import Level from './manager/rules/Level.vue';
import Login from './manager/Login.vue';
import Map from './manager/Map.vue';
import Members from './manager/Members.vue';
import Menu from './manager/Menu.vue';
import Organization from './manager/resources/Organization.vue';
import Reach from './manager/rules/Reach.vue';
import Relationship from './manager/resources/Relationship.vue';
import Report from './manager/Report.vue';
import Role from './manager/resources/Role.vue';
import Situation from './manager/resources/Situation.vue';
import Skill from './manager/resources/Skill.vue';

export default {
  name: 'App',
  components: {
    Box,
    Capacity,
    Color,
    Header,
    Language,
    Level,
    Login,
    Map,
    Members,
    Menu,
    Organization,
    Reach,
    Relationship,
    Report,
    Role,
    Situation,
    Skill
  },
  data: function() {
    return {
      feature: 'login'
    };
  },
  computed: {
    account: function() {
      return this.$store.getters.ACCOUNT;
    }
  },
  methods: {
    change: function( tag ) {
      this.feature = tag;
    },
    login: function() {
      this.$store.dispatch( 'LOAD' );
      this.feature = 'members';
    },
    logout: function() {
      this.feature = 'login';
      this.$store.dispatch( 'UNLOAD' );
    }
  }
}
</script>

<style>
html, body {
  height: 100%;
}

body {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  margin: 0;
  overflow: hidden;
  padding: 0;
}

section {
  display: flex;
  flex-basis: 0;
  flex-direction: row;
  flex-grow: 1;
}

#app {
  display: flex;
  flex-direction: column;
  flex-basis: 0;
  flex-grow: 1;
}
</style>
