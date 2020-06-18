<template>
  <Box
    direction="row" 
    :grow="1">

    <Master/>
    <Detail/>

  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import Detail from './members/Detail.vue';
import Master from './members/Master.vue';

export default {
  name: 'Members',
  components: {
    Box,
    Detail,
    Master
  }
}
</script>
