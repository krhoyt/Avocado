<template>
  <Box
    :grow="1"
    :margin-left="16"
    :margin-right="16"
    :margin-top="16">

    <Label
      :size="20">
      Level ({{items.length}})
    </Label>

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-top="16">
      <TextInput
        :error="error"
        helper="Member segment"        
        label="Name"
        placeholder="Name"
        :readonly="!editing"
        v-model="name"/>
      <Spacer
        :width="16"/>
      <TextInput
        :grow="0"
        label="Low"
        helper="Range inclusive"
        type="number"
        :width="150"
        placeholder="0"
        :readonly="!editing"
        v-model="low"
        value="0"/>
      <Spacer
        :width="16"/>
      <TextInput
        :grow="0"
        label="High"
        helper="Range inclusive"
        type="number"
        :width="150"
        placeholder="0"
        :readonly="!editing"
        v-model="high"
        value="0"/>
      <Spacer
        :width="16"/>
      <TextInput
        :grow="0"
        label="Count"
        helper="Number of times used"
        placeholder="0"
        :readonly="true"
        v-model="count"
        :width="150"/>
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
        field="low"
        :sortable="true"
        text="Low"
        :width="166"/>       
      <DataTableColumn
        field="high"
        :sortable="true"
        text="High"
        :width="166"/>                
      <DataTableColumn
        field="count"
        :sortable="true"
        text="Count"
        :width="150"/>               
    </DataTable>

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Button from '../../controls/Button.vue';
import DataTable from '../../controls/DataTable.vue';
import DataTableColumn from '../../controls/DataTableColumn.vue';
import Label from '../../controls/Label.vue';
import Select from '../../controls/Select.vue';
import Spacer from '../../controls/Spacer.vue';
import TextInput from '../../controls/TextInput.vue';

export default {
  name: 'Level',
  components: {
    Box,
    Button,
    DataTable,
    DataTableColumn,
    Label,
    Select,
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
        return this.$store.getters['picklist/levels/ACCOUNT'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/levels/SET_ACCOUNT', value );
      }
    },
    high: {
      get: function() {
        return this.$store.getters['picklist/levels/HIGH'].toString();
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/levels/SET_HIGH', value );
      }
    },
    low: {
      get: function() {
        return this.$store.getters['picklist/levels/LOW'].toString();
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/levels/SET_LOW', value );
      }
    },
    count: {
      get: function() {
        return this.$store.getters['picklist/levels/COUNT'].toString();
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/levels/SET_COUNT', value );
      }
    },
    id: {
      get: function() {
        return this.$store.getters['picklist/levels/ID'];
      },
      set: function( value ) {
        return this.$store.dispatch( 'picklist/levels/SET_ID', value );
      }
    },        
    items: {
      get: function() {
        return this.$store.getters.LEVELS;
      },
      set: function( value ) {
        this.$store.dispatch( 'SET_LEVELS', value );
      }
    },
    name: {
      get: function() {
        return this.$store.getters['picklist/levels/NAME'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/levels/SET_NAME', value );
      }
    },
    original: {
      get: function() {
        return this.$store.getters['picklist/levels/ORIGINAL'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/levels/SET_ORIGINAL', value );
      }
    }
  },
  methods: {
    add: function() {
      this.id = null;
      this.account = null;
      this.name = null;
      this.low = 0;
      this.high = 0;
      this.count = 0;

      this.editing = true;
    },
    cancel: function() {
      this.editing = false;
      this.error = null;

      if( this.id === null ) {
        this.account = null;
        this.name = null;
        this.low = 0;
        this.high = 0;
        this.count = 0;
      } else {
        this.account = this.items[this.original].account_id;
        this.name = this.items[this.original].name;
        this.low = this.items[this.original].low;
        this.high = this.items[this.original].high;
        this.count = this.items[this.original].count;
      }
    },
    change: function( index ) {
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
      this.low = this.items[index].low;
      this.name = this.items[index].name;
      this.high = this.items[index].high;
      this.count = this.items[index].count;
    },
    edit: function() {
      this.editing = true;
    },
    remove: function() {
      const id = this.id;
    
      this.editing = false;
      this.error = null;

      this.id = null;
      this.account = null;
      this.name = null;
      this.low = 0;
      this.high = 0;
      this.count = 0;

      this.items.splice( this.original, 1 );

      this.$store.dispatch( 'picklist/levels/REMOVE_LEVEL', id );
    },
    save: function() {
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
        this.$store.dispatch( 'picklist/levels/CREATE_LEVEL' );
      } else {
        this.$store.dispatch( 'picklist/levels/UPDATE_LEVEL' );
      }
    }
  }
}
</script>
