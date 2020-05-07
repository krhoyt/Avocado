<template>
  <Box
    background="#f4f4f4"
    :width="325">
    <Search
      @clear="search = null"
      v-model="search"/>
    <List
      @change="select( $event.item )"
      :data="filter"
      :grow="1"
      header="Members"
      label-field="name"/>
  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Label from '../../controls/Label.vue';
import List from '../../controls/List.vue';
import Search from '../../controls/Search.vue';

export default {
  name: 'Master',
  components: {
    Box,
    Label,
    List,
    Search
  },
  data: function() {
    return {
      search: null
    };
  },
  computed: {
    filter: function() {
      return this.$store.getters['community/MEMBERS']( this.search );
    }
  },
  methods: {
    select: function( item ) {
      if( item.id !== this.$store.getters['community/MEMBER_ID'] ) {
        this.$store.dispatch( 'community/READ_MEMBER', item.id );
      }
    }
  }
}
</script>
