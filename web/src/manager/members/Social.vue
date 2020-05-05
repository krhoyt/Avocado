<template>
  <Box
    v-show="active"
    background="#f4f4f4"
    :grow="1"
    :margin-left="16"
    :margin-right="16">

    <Box
      align="flex-end"
      direction="row"
      :margin-bottom="5"
      :margin-left="16"
      :margin-right="16"
      :margin-top="16">
      <Select
        helper="Social media integration"
        label="Channel"
        label-field="label"
        :options="channels"
        :readonly="!editing || selected.id !== null"
        ref="channel"
        theme="light"
        v-model="channel"
        :width="200"/>
      <Spacer
        :width="16"/>
      <TextInput
        :helper="this.channels[this.channel].value"
        :error="error"
        label="Endpoint"
        placeholder="Endpoint"
        :readonly="!editing"
        ref="endpoint"
        theme="light"
        v-model="endpoint"/>
    </Box>

    <Box
      direction="row"
      :margin-bottom="16"
      :margin-left="16"
      :margin-right="16">
      <Button
        @click.native="add"
        :disabled="readonly"
        disabled-icon="/img/add-disabled.svg"
        icon="/img/add.svg"
        v-show="!editing">
        Add
      </Button>      
      <Button
        @click.native="remove"
        disabled-icon="/img/delete-disabled.svg"
        icon="/img/delete.svg"
        kind="danger"
        v-show="editing && selected.id !== null">
        Delete
      </Button>
      <Spacer
        :grow="1"/>
      <Button
        @click.native="cancel"
        kind="secondary"
        v-show="editing">
        Cancel
      </Button>
      <Spacer
        :width="16"/>
      <Button
        @click.native="edit"
        :disabled="selected.id === null || readonly"
        disabled-icon="/img/edit-disabled.svg"
        icon="/img/edit.svg"
        v-show="selected.id !== null && !editing">
        Edit
      </Button>
      <Button
        @click.native="save"
        icon="/img/save.svg"
        v-show="editing">
        Save
      </Button>
    </Box>

    <Box
      direction="row"
      :margin-left="16"
      :margin-right="16">

      <Label
        background="#e0e0e0"
        :weight="600"
        :height="47"
        :padding-left="16"
        :width="216">
        Channel
      </Label>
      <Label
        background="#e0e0e0"
        :weight="600"
        :grow="1"
        :height="47"
        :padding-left="16">
        Endpoint
      </Label>
    </Box>

    <div 
      class="list">
      <Box
        class="item"
        @click.native="change( index )"
        direction="row"
        :key="index"
        v-for="( item, index ) in social">
        <Label
          :height="46"
          :padding-left="16"
          :width="216">
          {{item.channel}}
        </Label>
        <Label
          :grow="1"
          :height="46"
          :padding-left="16"
          :width="200">
          {{item.endpoint}}
        </Label>        
        <button
          class="launch"
          @click="link( item )">
        </button>
      </Box>
    </div>

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Button from '../../controls/Button.vue';
import Label from '../../controls/Label.vue';
import Select from '../../controls/Select.vue';
import TextInput from '../../controls/TextInput.vue';
import Spacer from '../../controls/Spacer.vue';

export default {
  name: 'Social',
  components: {
    Box,
    Button,
    Label,
    Select,
    Spacer,
    TextInput
  },
  props: {
    disabled: {type: Boolean, default: false},
    label: {type: String, default: null},
    readonly: {type: Boolean, default: false}
  },
  data: function() {
    return {
      active: false,
      editing: false,
      error: null,
      hint: 'RSS or ATOM, including HTTP/S'
    };
  },
  computed: {
    channel: {
      get: function() {
        return this.$store.getters['community/social/CHANNEL']
      },
      set: function( value ) {
        this.$store.dispatch( 'community/social/SET_CHANNEL', value );
      }
    },
    channels: function() {
      return this.$store.getters['community/social/CHANNELS'];
    },
    endpoint: {
      get: function() {
        return this.$store.getters['community/social/ENDPOINT'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/social/SET_ENDPOINT', value );
      }
    },
    selected: {
      get: function() {
        return this.$store.getters['community/social/SELECTED'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/social/SET_SELECTED' );
      }
    },
    social: function() {
      return this.$store.getters['community/social/SOCIAL'];
    } 
  }, 
  methods: {
    add: function() {
      this.$store.dispatch( 'community/social/CLEAR_SELECTED' );
      this.editing = true;
    },
    cancel: function() {
      this.editing = false;
      this.error = null;

      if( this.selected.id === null ) {
        this.$store.dispatch( 'community/social/CLEAR_SELECTED' );
      } else {
        this.$store.dispatch( 'community/social/RESTORE_ORIGINAL' );
      }
    },
    change: function( index ) {
      if( this.editing ) {
        let confirm = window.confirm( `Want to save your changes?` );

        if( confirm ) {
          // TODO: Check sync of operation
          // TODO: Change might happen before save
          this.save();
        }
      }

      this.editing = false;
      this.error = null;

      this.$store.dispatch( 'community/social/CHANGE', index );
    },
    edit: function() {
      this.$store.dispatch( 'community/social/COPY_SELECTED' );
      this.editing = true;
    },
    link: function( item ) {
      let url = null;

      for( let c = 0; c < this.channels.length; c++ ) {
        if( this.channels[c].entity === item.entity ) {
          url = this.channels[c].url === null ? item.endpoint : `${this.channels[c].url}${item.endpoint}`;
        }
      }

      if( url !== null ) {
        window.open( url, '_blank' );
      }
    },
    remove: function() {
      let confirm = window.confirm( 
        `Are you sure you want to remove this channel?`
      );

      if( confirm ) {
        const id = this.selected.id;

        this.editing = false;
        this.error = null;

        this.$store.dispatch( 'community/social/CLEAR_SELECTED' );
        this.$store.dispatch( 'community/social/REMOVE_CHANNEL', id );              
      }
    },
    save: function() {
      if( this.selected.endpoint === null ) {
        this.error = 'You must provide a valid endpoint';
        return;
      } else {
        if( this.selected.endpoint.trim().length === 0 ) {
          this.error = 'You must provide a valid endpoint';
          return;
        }
      }

      this.editing = false;
      this.error = null;

      if( this.selected.id === null ) {
        this.$store.dispatch( 'community/social/CREATE_CHANNEL' );        
      } else {
        this.$store.dispatch( 'community/social/UPDATE_CHANNEL' );
      }
    }
  }
}
</script>

<style scoped>
.launch {
  visibility: hidden;
}

.item:hover button.launch {
  background: none;
  background-image: url( /img/launch.svg );
  background-position: center;
  background-repeat: no-repeat;
  background-size: 16px;
  border: none;
  cursor: pointer;
  height: 46px;  
  outline: none;
  visibility: visible;
  width: 47px;
}

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

.list {
  background-color: white; 
  flex-basis: 0;    
  flex-grow: 1;
  margin-bottom: 24px;
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 0;
  overflow: scroll;      
}
</style>
