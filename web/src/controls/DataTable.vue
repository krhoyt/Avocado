<template>
  <Box
    :basis="0"
    :margin-bottom="marginBottom"
    :margin-left="marginLeft"
    :margin-right="marginRight"
    :margin-top="marginTop"
    :grow="1">
    <Box
      background="#e0e0e0"
      direction="row"
      ref="columns"
      v-show="headers">
      <slot></slot>
    </Box>
    <div 
      class="list"
      :class="{light: light}">      
      <Box
        class="item"
        :class="{selected: selected === index ? true : false}"
        @click.native="change( index )"
        direction="row"
        :grow="1"
        :key="index"
        v-for="( item, index ) in data">
        <Label
          :basis="0"
          :grow="column.grow"
          :height="46"
          :key="column.name"
          :padding-left="16"
          :padding-right="16"
          v-for="( column ) in $refs.columns.$children"
          :width="column.width">
          {{item[column.field]}}
        </Label>
      </Box>
    </div>
  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import DataTableColumn from '../controls/DataTableColumn.vue';
import Label from '../controls/Label.vue';

export default {
  name: 'DataTable',
  components: {
    Box,
    DataTableColumn,
    Label
  },
  props: {
    data: {
      type: Array, 
      default: function() {
        return [];
      }
    },
    headers: {type: Boolean, default: true},
    light: {type: Boolean, default: false},
    marginBottom: {type: Number, default: null},
    marginLeft: {type: Number, default: null},
    marginRight: {type: Number, default: null},
    marginTop: {type: Number, default: null}
  },
  data: function() {
    return {
      direction: null,
      selected: null,
      sort: null
    };
  },
  methods: {
    change: function( index ) {
      if( this.selected !== index ) {
        this.selected = index;
        this.$emit( 'change', index );
      }
    }
  }
}
</script>

<style scoped>
.item {
  border-bottom: solid 1px #e0e0e0;
}

.item:hover {
  background-color: #e5e5e5;
}

.item.selected {
  background-color: #e0e0e0;
}

.item.selected:hover {
  background-color: #cacaca;
}

.list div:last-of-type {
  border-bottom: solid 1px transparent;
}

.list {
  background-color: #f4f4f4; 
  flex-basis: 0;    
  flex-grow: 1;
  overflow: scroll;      
}

.list.light {
  background-color: #ffffff;
}
</style>
