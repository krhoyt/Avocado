<template>
  <Box
    :background="background"
    :grow="grow"
    :width="width">
    <Label
      background="#e0e0e0"
      :height="47"
      :padding-left="16"
      v-show="header !== null"
      :weight="600">
      {{header}} ({{data.length}})
    </Label>
    <div>
      <p
        v-for="( item, index ) in data"
        :key="index"
        :class="{selected: selected === index}"
        @click="select( index )">
        {{item[labelField]}}
      </p>
    </div>
  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import Label from '../controls/Label.vue';

export default {
  name: 'List',
  components: {
    Box,
    Label
  },
  props: {
    background: {type: String, default: null},
    data: {
      type: Array,
      default: function() {
        return [];
      }
    },
    grow: {type: Number, default: null},
    header: {type: String, default: null},
    labelField: {type: String, default: 'label'},
    width: {type: Number, default: null}
  },
  data: function() {
    return {
      selected: null
    };
  },
  methods: {
    select: function( index ) {
      this.selected = index;
      this.$emit( 'change', {
        item: this.data[index],
        index: index
      } );
    }
  }
}
</script>

<style scoped>
div {
  flex-basis: 0;
  flex-grow: 1;
  margin: 0;
  overflow: scroll;
  padding: 0;
}

p {
  border-bottom: solid 1px #e0e0e0;  
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 46px;
  line-height: 47px;
  margin: 0;
  overflow: hidden;
  padding: 0 16px 0 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

p:hover {
  background-color: #e5e5e5;
}

p.selected {
  background-color: #e0e0e0;
}

p.selected:hover {
  background-color: #cacaca;
}
</style>
