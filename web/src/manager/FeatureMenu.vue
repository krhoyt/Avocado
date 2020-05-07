<template>
  <div>
    <button
      class="developer"
      @click="select( 'community' )">
      <p>Members</p>
      <p>All the people in your community</p>
    </button>
    <button
      class="activity"
      @click="select( 'activity' )">
      <p>Activity Types</p>
      <p>How to contribute to the community</p>
    </button>    
    <button
      class="reach"
      @click="select( 'reach' )">
      <p>Reach Elements</p>
      <p>Define influence in the community</p>
    </button>        
    <button
      class="report"
      @click="select( 'report' )">
      <p>Report</p>
      <p>Community love, reach, and gravity</p>
    </button>    
    <button
      class="category"
      @click="select( 'list' )">
      <p>List Definitions</p>
      <p>Categories for lists and tags</p>
    </button>    
    <button
      class="map"
      @click="select( 'map' )"
      disabled>
      <p>Map</p>
      <p>Geographical view of the community</p>
    </button>
  </div>
</template>

<script>
export default {
  name: 'FeatureMenu',
  data: function() {
    return {
      display: false
    };
  },
  methods: {
    select: function( tag ) {
      this.$emit( 'change', tag );
    }
  }
}
</script>

<style scoped>
button {
  background: none;
  background-position: left 16px center;
  background-repeat: no-repeat;
  background-size: 20px;
  border: none;
  cursor: pointer;
  height: 47px;
  margin: 0;
  outline: none;
  padding: 0;
  text-align: left;
}

button:hover {
  background-color: #e5e5e5;
}

button p {
  color: #161616;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  padding: 0 16px 0 63px;
  margin: 0;
}

button p:first-of-type {
  font-weight: 600;
  margin-bottom: 2px;
}

button p:last-of-type {
  color: #393939;
  font-size: 12px;
}

button:disabled {
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: transparent;
}

button:disabled p {
  color: #d8d8d8;
}

div {
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba( 0, 0, 0, 0.30 );
  display: flex;
  flex-direction: column;
  left: 0;
  margin: 0;
  padding: 16px 0 16px 0;
  position: absolute;
  top: 47px;
  width: 325px;
}

.activity {
  background-image: url( /img/user-love.svg );
}

.developer {
  background-image: url( /img/group.svg );
}

.category {
  background-image: url( /img/list-dropdown.svg );
}

.map {
  background-image: url( /img/map-disabled.svg );
}

.reach {
  background-image: url( /img/bloch-sphere.svg );
}

.report {
  background-image: url( /img/report.svg );
}
</style>