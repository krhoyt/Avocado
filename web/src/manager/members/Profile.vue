<template>
  <Box
    v-show="active"
    background="#f4f4f4"
    :grow="1"
    :margin-left="16"
    :margin-right="16">
    <Box
      direction="row"    
      :margin-bottom="2"
      :margin-left="16"
      :margin-right="16"
      :margin-top="16">   
      <TagInput
        helper="Job functions regularly performed"      
        label="Roles"
        labelField="name"
        :limit="true"
        :menu="roles"
        placeholder="Roles"
        :readonly="readonly"
        ref="roles"
        theme="light"
        :value="role"/>              
    </Box>        
    <Box    
      direction="row"
      :margin-bottom="2"
      :margin-left="16"
      :margin-right="16">   
      <TagInput
        helper="Spoken fluency for a technical presentation"      
        label="Languages"
        labelField="name"
        :limit="true"
        :menu="languages"
        placeholder="Languages"
        :readonly="readonly"
        ref="languages"
        theme="light"
        :value="language"/>              
    </Box>    
    <Box    
      direction="row"
      :grow="1"
      :margin-bottom="5"
      :margin-left="16"
      :margin-right="16">   
      <TagInput
        helper="Capable of delivering hands-on training with zero preparation"      
        label="Skills"
        labelField="name"
        :limit="true"
        :menu="skills"
        placeholder="Skills"
        :readonly="readonly"      
        ref="skills"
        theme="light"
        :value="skill"/>
    </Box>
  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import TagInput from '../../controls/TagInput.vue';
import Spacer from '../../controls/Spacer.vue';

export default {
  name: 'Profile',
  components: {
    Box,
    Spacer,
    TagInput
  },
  props: {
    disabled: {type: Boolean, default: false},
    label: {type: String, default: null},
    readonly: {type: Boolean, default: false}
  },
  data: function() {
    return {
      active: false
    };
  },
  computed: {
    language: {
      get: function() {
        return this.$store.getters['community/LANGUAGES'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_LANGUAGES', value );
      }
    },
    languages: function() {
      return this.$store.getters.LANGUAGES;
    },
    relationship: {
      get: function() {
        return this.$store.getters['community/RELATIONSHIPS'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_RELATIONSHIPS', value );
      }
    },    
    relationships: function() {
      return this.$store.getters.RELATIONSHIPS;
    },
    role: {
      get: function() {
        return this.$store.getters['community/ROLES'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_ROLES', value );
      }
    },    
    roles: function() {
      return this.$store.getters.ROLES;
    },
    skill: {
      get: function() {
        return this.$store.getters['community/SKILLS'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_SKILLS', value );
      }
    },    
    skills: function() {
      return this.$store.getters.SKILLS;
    }
  }
}
</script>
