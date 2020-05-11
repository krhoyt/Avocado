<template>
  <button
    :class="{ascending: ascending, descending: descending, sortable: sortable}"
    @click="sort"
    :style="style">
    {{text}}
  </button>
</template>

<script>
import Label from './Label.vue';

export default {
  name: 'DataTableColumn',
  components: {
    Label
  },
  props: {
    compare: {type: String, default: null},
    field: {type: String, default: 'label'},
    grow: {type: Number, default: null},
    label: {type: String, default: null},
    sortable: {type: Boolean, default: false},
    text: {type: String, default: null},
    width: {type: Number, default: null}
  },
  data: function() {
    return {
      ascending: false,
      descending: false
    };
  },
  computed: {
    direction: {
      get: function() {
        if( this.ascending ) return 'asc';
        if( this.descending ) return 'desc';
        return null; 
      },
      set: function( value ) {
        if( value === null ) {
          this.ascending = false;
          this.descending = false;
        } else {
          if( value === 'asc' ) {
            this.ascending = true;
            this.descending = false;
          } else {
            this.ascending = false;
            this.descending = true;
          }
        }
      }
    },
    style: function() {
      return {
        flexGrow: this.width === null ? 1 : '',
        minWidth: this.width === null ? '' : ( this.width + 'px' )
      };
    }
  },
  methods: {
    sort: function() {
      if( !this.sortable ) {
        return;
      }

      const current = this.direction;

      if( current === null ) {
        this.ascending = true;
        this.descending = false;
      } else if( current === 'asc' ) {
        this.ascending = false;
        this.descending = true;
      } else {
        this.ascending = false;
        this.descending = false;
      }

      let parent = this.$parent;

      if( this.compare !== null ) {
        while( parent.$vnode.tag.indexOf( 'Box' ) >= 0 ) {
          parent = parent.$parent
        }

        parent[this.compare]( this );
      } else {
        while( parent.$vnode.tag.indexOf( 'DataTable' ) === -1 ) {
          parent = parent.$parent
        }

        parent.sorted( this.field, this.direction );
      }
    }
  }
}
</script>

<style scoped>
button {
  appearance: none;
  background: none;
  background-color: #e0e0e0;
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 20px;
  border: none;
  box-sizing: border-box;
  color: #161616;
  flex-basis: 0;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  height: 47px;
  margin: 0;
  outline: solid 2px transparent;
  outline-offset: -2px;  
  padding-left: 16px;
  padding-right: 16px;
  text-align: left;
}

button.sortable:hover {
  background-color: #cacaca;
  background-image: url( /img/sort.svg );
  cursor: pointer;
}

button.sortable:focus {
  outline: solid 2px #0f62fe;  
}

.ascending {
  background-image: url( /img/ascending.svg );
}

button.ascending:hover {
  background-image: url( /img/ascending.svg ); 
}

.descending {
  background-image: url( /img/descending.svg );
}

button.descending:hover {
  background-image: url( /img/descending.svg );
}
</style>
