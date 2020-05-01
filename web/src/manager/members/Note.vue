<template>
  <Box
    v-show="active"
    background="#f4f4f4"
    :grow="1"
    :margin-left="16"
    :margin-right="16">

    <Box
      direction="row"
      align="flex-end"
      :margin-bottom="5"
      :margin-left="16"
      :margin-right="16"
      :margin-top="16">
      <DatePicker
        helper="When did this take place?"
        label="Date"
        :readonly="!editing"
        theme="light"
        v-model="noted"/>
      <Spacer 
        :width="16"/>
      <Select
        helper="Where did this take place?"
        label="Situation"
        labelField="name"
        :options="situations"
        :readonly="!editing"
        ref="situation"
        theme="light"
        v-model="situation"
        :width="160"/>
      <Spacer 
        :width="16"/> 
      <TextInput
        helper="Any related files to be stored"
        label="Attachments"
        placeholder="Attachments"
        :readonly="true"
        theme="light"/>
      <Box
        direction="row"
        :margin-bottom="19"
        :margin-left="16">
        <Button
          :disabled="true"
          kind="tertiary"
          size="field">
          Add file
        </Button>
      </Box>
    </Box>

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-left="16"
      :margin-right="16">
      <TextInput 
        :error="error"
        label="Description"
        placeholder="Description"
        :readonly="!editing"
        theme="light"
        v-model="selected.full_text"/>
    </Box>
    
    <Box
      direction="row"
      :margin-bottom="16"
      :margin-left="16"
      :margin-right="16">
      <Button
        :disabled="readonly"
        disabled-icon="/img/add-disabled.svg"
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
        :disabled="selected.account_id === null || readonly"
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
        :width="120">
        Date
      </Label>
      <Label 
        background="#e0e0e0" 
        :weight="600" 
        :height="47" 
        :padding-left="16"
        :width="120">
        Situation
      </Label>
      <Label 
        background="#e0e0e0" 
        :weight="600" 
        :grow="1"
        :height="47" 
        :padding-left="16">
        Description
      </Label>      
    </Box>

    <div 
      class="list">

      <Box
        class="item"
        @click.native="change( index )"        
        direction="row"
        :key="index"
        v-for="( item, index ) in notes">

        <Label
          :height="47"
          :padding-left="16"
          :width="120">
          {{item.noted_at | long}}
        </Label>
        <Label
          :height="47"
          :padding-left="16"
          :width="120">
          {{item.situation_name}}
        </Label>
        <Label
          :grow="1"
          :height="47"
          :padding-left="16">
          {{item.full_text}}
        </Label>          
      </Box>

    </div>

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Button from '../../controls/Button.vue';
import DatePicker from '../../controls/DatePicker.vue';
import Label from '../../controls/Label.vue';
import Select from '../../controls/Select.vue';
import Spacer from '../../controls/Spacer.vue';
import TextArea from '../../controls/TextArea.vue';
import TextInput from '../../controls/TextInput.vue';

export default {
  name: 'Note',
  components: {
    Box,
    Button,
    DatePicker,
    Label,
    Select,
    Spacer,
    TextArea,
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
      error: null
    };
  },
  computed: {
    description: {
      get: function() {
        return this.$store.getters['community/notes/DESCRIPTION'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/notes/SET_DESCRIPTION', value );
      }
    },
    noted: {
      get: function() {
        return this.$store.getters['community/notes/NOTED']
      },
      set: function( value ) {
        this.$store.dispatch( 'community/notes/SET_NOTED', value );
      }
    },
    notes: function() {
      return this.$store.getters['community/notes/NOTES'];
    },
    selected: {
      get: function() {
        return this.$store.getters['community/notes/SELECTED'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/notes/SET_SELECTED', value );
      }
    },
    situation: {
      get: function() {
        return this.$store.getters['community/notes/SITUATION'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/notes/SET_SITUATION', value );
      }
    },
    situations: function() {
      return this.$store.getters.SITUATIONS;
    }
  },
  methods: {
    add: function() {
      this.clear();
      this.editing = true;
    },
    cancel: function() {
      this.editing = false;
      this.error = null;

      if( this.selected.id === null ) {
        this.clear()
      } else {
        this.restore();

        for( let s = 0; s < this.situations.length; s++ ) {
          if( this.situations[s].id === this.selected.situation_id ) {
            this.situation = s;
            break;
          }
        }
      }
    },
    clear: function() {
      this.$store.dispatch( 'community/notes/CLEAR_SELECTED' );
    },
    copy: function() {
      this.$store.dispatch( 'community/notes/COPY_SELECTED' );      
    }, 
    change: function( index ) {
      if( this.editing ) {
        let confirm = window.confirm( `Want to save your changes?` );

        if( confirm ) {
          this.save();
        }
      }

      this.editing = false;
      this.error = null;

      this.selected = this.notes[index];

      const noted = new Date( this.selected.noted_at );
      const year = noted.getFullYear();
      const month = String( noted.getMonth() + 1 ).padStart( 2, '0' );
      const date = String( noted.getDate() ).padStart( 2, '0' );
      this.noted = `${year}-${month}-${date}`;

      for( let s = 0; s < this.situations.length; s++ ) {
        if( this.situations[s].id === this.selected.situation_id ) {
          this.situation = s;
          break;
        }
      }
    }, 
    edit: function() {
      this.copy();
      this.editing = true;
    },       
    remove: function() {
      this.editing = false;
      this.error = null;

      this.$store.dispatch( 'community/notes/REMOVE_NOTE' );
    },    
    restore: function() {
      this.$store.dispatch( 'community/notes/RESTORE_ORIGINAL' );
    },
    save: function() {
      if( this.description === null ) {
        this.error = 'You must provide a description';
        return;
      }

      this.editing = false;
      this.error = null;

      if( this.selected.id === null ) {
        this.$store.dispatch( 'community/notes/CREATE_NOTE' );
      } else {
        this.$store.dispatch( 'community/notes/UPDATE_NOTE' );
      }
    }     
  },
  filters: {
    long: function( value ) {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const at = new Date( value );

      return `${at.getDate()} ${months[at.getMonth()]} ${at.getFullYear()}`;
    }
  }
}
</script>

<style scoped>
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

