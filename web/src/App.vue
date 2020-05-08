<template>
  <Box
    direction="column"
    :grow="1">

    <Header
      :decorate="decorate"
      @logout="logout"
      @menu="menu = !menu"/>

    <Members
      v-show="feature === 'community'"/>
    <Query
      v-show="feature === 'activity'"/>
    <Reach
      v-show="feature === 'reach'"/>      
    <Report
      v-show="feature === 'report'"/>      
    <PickList
      v-show="feature === 'list'"/>
    <Map
      v-show="feature === 'map'"/>
    <Login
      @login="login( $event )"
      v-show="feature === 'login'"/>

    <FeatureMenu
      @change="change( $event )"
      v-show="menu"/>

  </Box>
</template>

<script>
import Box from './containers/Box.vue';
import FeatureMenu from './manager/FeatureMenu.vue';
import Header from './manager/Header.vue';
import Login from './manager/Login.vue';
import Map from './manager/Map.vue';
import Members from './manager/members/Members.vue';
import Reach from './manager/picklist/Reach.vue';
import Report from './manager/Report.vue';
import PickList from './manager/picklist/PickList.vue';
import Query from './manager/picklist/Query.vue';

export default {
  name: 'App',
  components: {
    Box,
    FeatureMenu,
    Header,
    Login,
    Map,
    Members,    
    PickList,
    Query,
    Reach,
    Report    
  },
  data: function() {
    return {
      feature: 'login',
      menu: false
    };
  },
  computed: {
    decorate: function() {
      return this.account === null ? false : true;
    }
  },
  methods: {
    change: function( tag ) {
      this.feature = tag;
      this.menu = false;
    },
    login: function() {
      this.$store.dispatch( 'LOAD' );
      this.$store.dispatch( 'community/LOAD' );

      this.feature = 'community';      
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
