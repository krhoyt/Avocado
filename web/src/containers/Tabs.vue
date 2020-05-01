<template>
  <Box 
    :grow="1"
    ref="tabs">

    <ul>
      <li 
        :class="{selected: tab.active, disabled: tab.disabled}"
        @click="select( index )"
        :key="index"
        v-for="( tab, index ) in tabs">
        {{tab.label}}
      </li>
    </ul>

    <slot></slot>

  </Box>
</template>

<script>
import Box from './Box.vue';

export default {
  name: 'Tabs',
  components: {
    Box
  },
  data: function() {
    return {
      tabs: []
    };
  },
  mounted: function() {
    this.tabs = this.$refs.tabs.$children;
    this.select( 0 );
  },
  methods: {
    select: function( index ) { 
      if( this.tabs[index].disabled ) {
        return;
      }
      
      for( let t = 0; t < this.tabs.length; t++ ) {
        if( t === index ) {
          this.tabs[t].active = true;
        } else {
          this.tabs[t].active = false;
        }
      }
    }
  }
}
</script>

<style scoped>
ul {
  display: flex;
  flex-direction: row;
  list-style-type: none;  
  margin: 0 16px 0 16px;
  padding: 0;
}

ul li {
  background-color: #e0e0e0;
  border-right: solid 1px #8d8d8d;
  border-top: solid 2px transparent;
  box-sizing: border-box;
  color: #393939;
  cursor: pointer;
  height: 47px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 47px;
  margin: 0;
  min-width: 160px;
  padding: 0 0 0 16px;
}

ul li:not( .selected ):hover {
  background-color: #cacaca;
}

ul li.selected {
  background-color: #f4f4f4;  
  border-right: solid 1px transparent;  
  border-top: solid 2px #0f62fe;  
  color: #161616;
  font-weight: 600;
}

ul li.disabled {
  background-color: #c6c6c6;
  color: #8d8d8d;
  cursor: not-allowed;
}

ul li.disabled:not( .selected ):hover {
  background-color: #c6c6c6;
}

ul li:last-of-type {
  border-right: solid 1px transparent;    
}
</style>
