<template>
  <Box
    :grow="1"
    :margin-left="16"
    :margin-right="16"
    :margin-top="16">

    <Label
      :size="20">
      Colors ({{items.length}})
    </Label>

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-top="16">
      <TextInput
        :error="error"
        helper="How you choose to label this wavelength"        
        label="Name"
        placeholder="Name"
        :readonly="!editing"
        v-model="name"/>
      <Spacer
        :width="16"/>
      <TextInput
        :grow="0"
        helper="Used for text (CSS formats)"
        label="Foreground"
        placeholder="Foreground"
        :readonly="!editing"
        v-model="foreground"
        :width="200"/>
      <Spacer
        :width="16"/>
      <TextInput
        :grow="0"
        label="Background"
        helper="Used for shapes (CSS formats)"
        placeholder="Background"
        :readonly="!editing"
        v-model="background"
        :width="200"/>
    </Box>
    <Box
      direction="row"
      :margin-bottom="16">
      <Button
        @click.native="add"
        icon="/img/add.svg"
        v-show="!editing">
        Add
      </Button>      
      <Button
        @click.native="remove"
        disabled-icon="/img/delete-disabled.svg"
        icon="/img/delete.svg"
        kind="danger"
        v-show="editing && id !== null">
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
        :disabled="account === null"
        disabled-icon="/img/edit-disabled.svg"
        icon="/img/edit.svg"
        v-show="id !== null && !editing">
        Edit
      </Button>
      <Button
        @click.native="save"
        icon="/img/save.svg"
        v-show="editing">
        Save
      </Button>
    </Box>

    <DataTable
      @change="change( $event )"
      :data="items"
      :margin-bottom="24"
      :selectable="true">
      <DataTableColumn
        field="name"
        :grow="1"
        :sortable="true"
        text="Name"/>
      <DataTableColumn
        field="foreground"
        text="Foreground"
        :width="216"/>
      <DataTableColumn
        field="background"
        text="Background"
        :width="200"/>                
    </DataTable>    

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Button from '../../controls/Button.vue';
import DataTable from '../../controls/DataTable.vue';
import DataTableColumn from '../../controls/DataTableColumn.vue';
import Label from '../../controls/Label.vue';
import Spacer from '../../controls/Spacer.vue';
import TextInput from '../../controls/TextInput.vue';

export default {
  name: 'Color',
  components: {
    Box,
    Button,
    DataTable,
    DataTableColumn,
    Label,
    Spacer,
    TextInput
  },
  data: function() {
    return {
      editing: false,
      error: null
    };
  },
  computed: {
    account: {
      get: function() {
        return this.$store.getters['picklist/colors/ACCOUNT'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/colors/SET_ACCOUNT', value );
      }
    },
    background: {
      get: function() {
        return this.$store.getters['picklist/colors/BACKGROUND'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/colors/SET_BACKGROUND', value );
      }
    },    
    foreground: {
      get: function() {
        return this.$store.getters['picklist/colors/FOREGROUND'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/colors/SET_FOREGROUND', value );
      }
    },
     id: {
      get: function() {
        return this.$store.getters['picklist/colors/ID'];
      },
      set: function( value ) {
        return this.$store.dispatch( 'picklist/colors/SET_ID', value );
      }
    },        
    items: {
      get: function() {
        return this.$store.getters.COLORS;
      },
      set: function( value ) {
        this.$store.dispatch( 'SET_COLORS', value );
      }
    },
    name: {
      get: function() {
        return this.$store.getters['picklist/colors/NAME'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/colors/SET_NAME', value );
      }
    },
    original: {
      get: function() {
        return this.$store.getters['picklist/colors/ORIGINAL'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/colors/SET_ORIGINAL', value );
      }
    }
  },
  methods: {
    add: function() {
      this.id = null;
      this.account = null; 
      this.name = null;
      this.background = null;
      this.foreground = null;

      this.editing = true;
    },
    cancel: function() {
      this.editing = false;
      this.error = null;

      if( this.id === null ) {
        this.account = null;
        this.name = null;
        this.foreground = null;
        this.background = null;
      } else {
        this.account = this.items[this.original].account_id;
        this.name = this.items[this.original].name;
        this.foreground = this.items[this.original].foreground;
        this.background = this.items[this.original].background; 
      }
    },
    change: async function( index ) {
      if( this.editing ) {
        let confirm = window.confirm( `Want to save your changes to ${this.name}?` );

        if( confirm ) {
          this.save();
        }
      }

      this.editing = false;
      this.error = null;

      this.original = index;
      this.id = this.items[index].id;
      this.account = this.items[index].account_id;
      this.name = this.items[index].name;
      this.foreground = this.items[index].foreground;
      this.background = this.items[index].background;
    },
    edit: function() {
      this.editing = true;
    },
    remove: async function() {
      const id = this.id;
    
      this.editing = false;
      this.error = null;

      this.id = null;
      this.account = null;      
      this.name = null;
      this.foreground = null;
      this.background = null;

      this.items.splice( this.original, 1 );

      this.$store.dispatch( 'picklist/colors/REMOVE_COLOR', id );
    },
    save: async function() {
      if( this.name === null ) {
        this.error = 'You must provide a name value';
        return;
      } else {
        if( this.name.trim().length === 0 ) {
          this.error = 'You must provide a name value';
          return;
        }
      }

      this.editing = false;
      this.error = null;
      
      if( this.id === null ) {
        this.$store.dispatch( 'picklist/colors/CREATE_COLOR' );
      } else {
        this.$store.dispatch( 'picklist/colors/UPDATE_COLOR' );
      }
    }
  }
}
</script>
