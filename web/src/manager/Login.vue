<template>
  <Box
    align="center"
    background="#f4f4f4"
    :grow="1"
    justify="center">    

    <!-- Dialog -->
    <!-- Visual box (panel) -->
    <Box
      background="#ffffff"
      :width="450">

      <!-- Header -->
      <Box
        :margin-bottom="48"
        :margin-left="16"
        :margin-top="16">

        <!-- Title -->
        <Label
          :size="20">
          Log in
        </Label>

        <!-- Create account -->
        <Box
          direction="row"
          :margin-top="4"
          v-show="step === 'email'">
          <Label
            color="#393939">
            Don't have an account?
          </Label>
          <LinkButton           
            :disabled="true"
            :inline="true"
            :margin-left="6"
            title="Not yet available - coming soon">
            Create an account
          </LinkButton>
        </Box>

        <!-- Change login user ID -->
        <Box
          direction="row"
          :margin-top="4"
          v-show="step === 'password'">
          <Label
            color="#393939">
            Logging in as {{email}}
          </Label>
          <LinkButton           
            @click.native="reset"
            :inline="true"
            :margin-left="6">
            Not you?
          </LinkButton>
        </Box>      

      </Box>

      <!-- Header rule -->
      <Spacer
        background="#e0e0e0"
        :margin-left="16"
        :margin-right="16"
        :height="1"/>

      <!-- Form (Step 1: Email) -->
      <Box
        :margin-left="16"
        :margin-right="16"
        v-show="step === 'email'">

        <!-- Email label -->
        <!-- Includes forgot -->
        <Box
          direction="row"
          :margin-bottom="6"
          :margin-top="11"         >
          <Label
            color="#393939"
            :size="12">
            Email address
          </Label>
          <Spacer
            :grow="1"/>
          <LinkButton
            :disabled="true"
            :size="12"
            title="Not yet available - coming soon">
            Forgot email?
          </LinkButton>
        </Box>

        <!-- Email -->
        <TextInput
          @enter="emailStep"
          :error="error"
          placeholder="Email address"
          ref="email"
          v-model="email"/>

      </Box>

      <!-- Form (Step 2: Password) -->
      <Box
        :margin-left="16"
        :margin-right="16"
        v-show="step === 'password'">

        <!-- Password label -->
        <!-- Includes forgot -->
        <Box
          direction="row"
          :margin-bottom="6"
          :margin-top="11">
          <Label
            color="#393939"
            :size="12">
            Password
          </Label>
          <Spacer
            :grow="1"/>
          <LinkButton
            :disabled="true"
            :size="12">
            Forgot password?
          </LinkButton>
        </Box>

        <!-- Password -->
        <TextInput
          @enter="passwordStep"
          :error="error"
          placeholder="Password"
          ref="password"
          type="password"
          v-model="password"/>
      </Box>      
      
      <!-- Buttons -->
      <Box
        :basis="0"
        direction="row"
        :grow="1"
        :margin-top="21">

        <!-- Nothing on the left side -->
        <!-- TODO: Consider back button -->
        <Spacer
          :basis="0"
          :grow="1"/>

        <!-- Continue -->
        <!-- Visible in email step -->
        <Button
          @click.native="emailStep"
          icon="/img/arrow.svg"
          kind="modal"
          v-show="step === 'email'">
          Continue
        </Button>          

        <!-- Login -->
        <!-- Visible in password step -->
        <Button
          @click.native="passwordStep"
          :disabled="network"
          disabledIcon="/img/arrow-disabled.svg"
          icon="/img/arrow.svg"
          kind="modal"
          v-show="step === 'password'">
          Log in
        </Button>          

      </Box>
    </Box>

    <!-- Help -->
    <!-- After dialog (visible box) -->
    <Box
      direction="row"
      :margin-left="16"
      :margin-top="16"
      :width="450">
      <Label
        color="#393939">
        Need help?
      </Label>
      <LinkButton
        @click.native="contact"
        :inline="true"
        :margin-left="6">
        Contact the team
      </LinkButton>
    </Box>

  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import Button from '../controls/Button.vue';
import Label from '../controls/Label.vue';
import LinkButton from '../controls/LinkButton.vue';
import Spacer from '../controls/Spacer.vue';
import TextInput from '../controls/TextInput.vue';

import Account from '../rpc/account.js';

export default {
  name: 'Login',
  components: {
    Box,
    Button,
    Label,
    LinkButton,
    Spacer,
    TextInput
  },
  data: function() {
    return {
      email: null,
      error: null,
      network: false,
      password: null,
      step: 'email'
    };
  },
  mounted: function() {
    this.$refs.email.focus();
  },
  methods: {
    contact: function() {
      window.location.href = 'mailto:krhoyt@us.ibm.com?subject=Contact Manager Help';
    },
    emailStep: function() {
      let message = 'An email address is required to login';

      if( this.email === null ) {
        this.error = message;
      } else {
        if( this.email.trim().length > 0 ) {
          this.error = null;
          this.step = 'password';

          this.$nextTick( () => {
            this.$refs.password.focus();
          } );          
        } else {
          this.error = message;
        }
      }
    },
    passwordStep: async function() {
      let message = 'A password will help you log in';

      if( this.password === null ) {
        this.error = message;
      } else {
        if( this.password.trim().length > 0 ) {
          this.error = null;
          this.network = true;          

          // TODO: Consider moving to store
          let account = await Account.login( 
            this.email, 
            this.password 
          );

          if( account.hasOwnProperty( 'found' ) ) {
            this.password = null;
            this.error = 'Email and password do not match';
          } else {
            this.$store.dispatch( 'SET_ACCOUNT', account );

            this.$emit( 'login' );
            this.reset();
          }
        } else {
          this.error = message;
        }
      }
    },
    reset: function() {
      this.email = null;      
      this.error = null;
      this.network = false;      
      this.password = null;
      this.step = 'email';

      this.$nextTick( () => {
        this.$refs.email.focus();
      } );                
    }
  }
}
</script>
