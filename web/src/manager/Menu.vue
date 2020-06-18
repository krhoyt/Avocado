<template>
  <Box
    background="#262626"
    style="padding-top: 16px;"
    :width="250">       
    <button
      :class="{selected: selected === 0}"
      class="members branch"
      @click="select( 0, 'members' )">
      Members
    </button>
    <div class="tray">
      <Tag 
        style="float: left;"
        background="#d0e2ff"
        :disabled="true"
        foreground="#0043ce">
        Federated
      </Tag>
      <Tag 
        style="float: left;"
        background="#e8daff"
        :disabled="true"
        foreground="#6929c4">
        London
      </Tag>      
      <Tag 
        style="float: left;"
        background="#9ef0f0"
        :disabled="true"
        foreground="#005d5d">
        Open Source
      </Tag>      
      <Tag 
        style="float: left;"
        background="#a7f0ba"
        :disabled="true"
        foreground="#0e6027">
        San Francisco
      </Tag>      
    </div>
    <button
      :class="{selected: selected === 1}"
      class="activities branch"
      @click="select( 1, 'activities' )">
      Activities
    </button>
    <button
      :class="{selected: selected === 2}"
      class="reports branch"
      @click="select( 2, 'reports' )">
      Reports
    </button>
    <Label
      color="#f4f4f4"
      :height="32"
      style="padding-left: 44px; border-left: solid 4px transparent; background-image: url( /img/rule.svg ); background-position: left 12px center; background-repeat: no-repeat; background-size: 18px;"
      :weight="600">
      Rules
    </Label>            
    <button
      :class="{selected: selected === 3}"
      class="leaf"
      @click="select( 3, 'types' )">    
      Activity Types
    </button>        
    <button
      :class="{selected: selected === 4}"
      class="leaf"
      @click="select( 4, 'elements' )">    
      Reach Elements
    </button>          
    <button
      :class="{selected: selected === 5}"
      class="leaf"
      @click="select( 5, 'levels' )">        
      Levels
    </button>         
    <Label
      color="#f4f4f4"
      :height="32"
      style="padding-left: 44px; border-left: solid 4px transparent; background-image: url( /img/list-dropdown.svg ); background-position: left 12px center; background-repeat: no-repeat; background-size: 18px;"
      :weight="600">
      Resources
    </Label>        
    <button
      :class="{selected: selected === 6}"
      class="leaf"
      @click="select( 6, 'colors' )">        
      Colors
    </button>    
    <button
      :class="{selected: selected === 7}"
      class="leaf"
      @click="select( 7, 'languages' )">        
      Languages
    </button>
    <button
      :class="{selected: selected === 8}"
      class="leaf"
      @click="select( 8, 'organizations' )">        
      Organizations
    </button>            
    <button
      :class="{selected: selected === 9}"
      class="leaf"
      @click="select( 9, 'relationships' )">            
      Relationships
    </button>       
    <button
      :class="{selected: selected === 10}"
      class="leaf"
      @click="select( 10, 'roles' )">        
      Roles
    </button>                 
    <button
      :class="{selected: selected === 11}"
      class="leaf"
      @click="select( 11, 'situations' )">        
      Situations
    </button>    
    <button
      :class="{selected: selected === 12}"
      class="leaf"
      @click="select( 12, 'skills' )">            
      Skills
    </button>        
    <button
      :class="{selected: selected === 13}"
      class="map branch"
      @click="select( 13, 'map' )">
      Map
    </button>            
  </Box>  
</template>

<script>
import Box from '../containers/Box.vue';
import Label from '../controls/Label.vue';
import Tag from '../controls/Tag.vue';

export default {
  name: 'Menu',
  components: {
    Box,
    Label,
    Tag
  },
  data: function() {
    return {
      selected: 0
    };
  },
  methods: {
    select: function( index, tag ) {
      this.selected = index;
      this.$emit( 'change', tag );
    }
  }
}
</script>

<style scoped>
button {
  background: none;
  border: none;
  background-position: left 12px center; 
  background-repeat: no-repeat; 
  background-size: 18px;
  border-left: solid 4px transparent;   
  color: #f4f4f4;
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  height: 32px;
  outline: solid 2px transparent;
  outline-offset: -2px;
  text-align: left;
}

button:focus {
  outline: solid 2px #0f62fe;
}

button:hover {
  background-color: #4d4d4d
}

.activities {
  background-image: url( /img/user-love.svg );
}

.branch {
  font-weight: 600;
  padding: 0 0 0 44px;
}

.leaf {
  border-left: solid 4px transparent;   
  font-weight: 400;  
  padding-left: 60px;   
}

.map {
  background-image: url( /img/map.svg );
}

.members {
  background-image: url( /img/group.svg );
}

.reports {
  background-image: url( /img/report.svg );
}

.selected {
  background-color: #4c4c4c;
  border-left: solid 4px #0f62fe; 
  color: #ffffff;  
  cursor: default;
}

.tray {
  background-color: #393939; 
  padding: 8px 8px 16px 8px;  
  max-height: 250px;
  overflow-y: scroll;
}
</style>
