<template>
  <Box
    :basis="0"
    :margin-bottom="marginBottom"
    :margin-left="marginLeft"
    :margin-right="marginRight"
    :margin-top="marginTop"
    :grow="1">
    <Box
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
        :class="{selectable: selectable, selected: selected === index ? true : false}"
        @click.native="change( index )"
        direction="row"
        :grow="1"
        :key="index"
        v-for="( item, index ) in filtered">
        <Label
          :basis="0"
          :grow="column.grow"
          :height="45"
          :key="column.name"
          :padding-left="16"
          :padding-right="16"
          v-for="( column ) in $refs.columns.$children"
          :width="column.width">
          {{format( item, column.label, column.field )}}
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
    marginTop: {type: Number, default: null},
    selectable: {type: Boolean, default: false}
  },
  data: function() {
    return {
      direction: null,
      filtered: [],
      selected: null,
      sort: null
    };
  },
  watch: {
    data: function( value, old ) {
      this.filtered = this.data.slice();
    }
  },
  methods: {
    change: function( index ) {
      if( !this.selectable ) {
        return;        
      }

      if( this.selected !== index ) {
        this.selected = index;
        this.$emit( 'change', index );
      }
    },
    format: function( item, label, field ) {
      if( label === null ) {
        return item[field];
      }

      let parent = this.$parent;

      while( parent.$vnode.tag.indexOf( 'Box' ) >= 0 ) {
        parent = parent.$parent
      }

      return parent[label]( item[field] );
    },
    sorted: function( field, direction ) {
      if( direction === null ) {
        this.filtered = this.data.slice();        
      } else {
        this.filtered.sort( ( a, b ) => {
          if( a[field] > b[field] ) return direction === 'asc' ? 1 : -1;
          if( a[field] < b[field] ) return direction === 'asc' ? -1 : 1;
          return 0;        
        } );        
      }

      for( let c = 0; c < this.$refs.columns.$children.length; c++ ) {
        if( this.$refs.columns.$children[c].field !== field ) {
          this.$refs.columns.$children[c].direction = null;
        }
      }
    }
  }
}
</script>

<style scoped>
.item {
  border-bottom: solid 1px #e0e0e0;
  border-top: solid 1px transparent;
}

.item.selectable:hover {
  background-color: #e5e5e5;
}

.item.selected {
  background-color: #e0e0e0;
  border-bottom: solid 1px #c6c6c6;
}

.item.selected:first-of-type {
  border-top: solid 1px #c6c6c6;
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
