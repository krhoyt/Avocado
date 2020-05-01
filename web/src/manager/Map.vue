<template>
  <Box
    direction="row"
    :grow="1">

    <div
      ref="map">
    </div>
    
    <Box
      :margin-left="16"
      :margin-right="16"
      :margin-top="16"
      :width="325">

      <TextInput
        :grow="0"
        label="Full name"
        :readonly="true"/>
      <TextInput
        :grow="0"
        label="Email address"
        :readonly="true"/>        
      <TextArea
        :grow="1"
        label="Description"
        :readonly="true"/>

    </Box>

  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import TextArea from '../controls/TextArea.vue';
import TextInput from '../controls/TextInput.vue';

import Member from '../rpc/member.js';

export default {
  name: 'Map',
  components: {
    Box,
    TextArea,
    TextInput
  },
  props: {
    token: {type: String, default: null}
  },
  data: function() {
    return {
      developers: [],
      map: null,
      tileLayer: null
    };
  },
  watch: {
    token: async function( value, old ) {
      if( this.token !== null ) {
        let results = await Developer.browse( this.token );
        let bounds =  [];

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].latitude !== null ) {
            bounds.push( [
              results[r].latitude,
              results[r].longitude
            ] );

            let marker = L.marker(
              [results[r].latitude, results[r].longitude]
            );
            marker.bindPopup( `
              <b>${results[r].name}</b><br>
              ${results[r].title}
            ` );
            marker.addTo( this.map );
          }
        }

        this.map.invalidateSize( false );
        this.map.fitBounds( L.latLngBounds( bounds ) );
      } else {
        // TODO: Remove markers
      }
    }
  },
  mounted: function() {
    this.map = L.map( this.$refs.map );
    this.tileLayer = L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png', 
      {
        maxZoom: 18,
        attribution: `
          &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,
          &copy; <a href="https://carto.com/attribution">CARTO</a>
        `,
      }
    );
    this.tileLayer.addTo( this.map );
  }
}
</script>

<style scoped>
div {
  flex-basis: 0;
  flex-grow: 1;  
}
</style>
