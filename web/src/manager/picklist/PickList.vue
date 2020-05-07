<template>
  <Box
    direction="row"
    :grow="1">

    <List
      background="#f4f4f4"
      @change="select( $event.index )"
      :grow="0"
      header="List Definitions"
      :data="lists"
      :width="325"/>

    <Color
      v-show="selected === 0"/>
    <Language
      v-show="selected === 1"/>
    <Organization
      v-show="selected === 2"/>                
    <Relationship
      v-show="selected === 3"/>      
    <Role
      v-show="selected === 4"/>        
    <Situation
      v-show="selected === 5"/>                  
    <Skill
      v-show="selected === 6"/>                        

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Color from './Color.vue';
import Label from '../../controls/Label.vue';
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
    Color,
    Label,
    Language,
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
        {label: 'Color'},
        {label: 'Language'},
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
