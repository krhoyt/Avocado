<template>
  <Box
    direction="row"
    :grow="1">

    <List
      background="#f4f4f4"
      @change="select( $event.index )"
      :grow="0"
      header="Pick List"
      :data="lists"
      :width="325"/>

    <Capacity
      v-show="selected === 0"/>
    <Color
      v-show="selected === 1"/>
    <Language
      v-show="selected === 2"/>
    <Level
      v-show="selected === 3"/>      
    <Organization
      v-show="selected === 4"/>                
    <Relationship
      v-show="selected === 5"/>      
    <Role
      v-show="selected === 6"/>        
    <Situation
      v-show="selected === 7"/>                  
    <Skill
      v-show="selected === 8"/>                        

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Capacity from './Capacity.vue';
import Color from './Color.vue';
import Label from '../../controls/Label.vue';
import Level from './Level.vue';
import List from '../../controls/List.vue';
import Language from './Language.vue';
import Organization from './Organization.vue';
import Relationship from './Relationship.vue';
import Role from './Role.vue';
import Situation from './Situation.vue';
import Skill from './Skill.vue';

export default {
  name: 'PickList',
  components: {
    Box,
    Capacity,
    Color,
    Label,
    Language,
    Level,
    List,
    Organization,
    Relationship,
    Role,
    Situation,
    Skill
  },
  data: function() {
    return {
      lists: [
        {label: 'Capacity'},
        {label: 'Color'},
        {label: 'Language'},
        {label: 'Level'},
        {label: 'Organization'},
        {label: 'Relationship'},
        {label: 'Role'},
        {label: 'Situation'},
        {label: 'Skill'}
      ],
      selected: 0
    };
  },
  methods: {
    select: function( index ) {
      this.selected = index;
    }
  }
}
</script>
