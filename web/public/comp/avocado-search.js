class Search extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' )
    template.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-basis: 0;
          flex-direction: row;
          flex-grow: 1;
          position: relative;
        }

        button {
          background: none;
          background-image: url( /img/clear.svg );
          background-position: center;
          background-repeat: no-repeat;
          background-size: 16px;
          border: none;
          cursor: pointer;
          display: none;
          height: 36px;
          outline: none;
          position: absolute;
          top: 18px;
          right: 18px;
          width: 40px;
        }

        button:hover {
          background-color: #e5e5e5;
        }

        input {
          background: none;
          background-color: #f4f4f4;
          background-image: url( /img/search.svg );
          background-position: left 14px center;
          background-repeat: no-repeat;
          background-size: 16px;
          border: none;
          border-bottom: solid 1px #8d8d8d;
          color: #161616;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          height: 40px;
          line-height: 40px;
          margin: 16px 16px 0 16px;
          outline: solid 2px transparent;
          padding: 0 16px 0 40px;
        }
        
        input:focus {
          outline: solid 2px #0f62fe;
        }
        
        input::placeholder {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
        }        
      </style>
      <input>
      <button></button>
    `;

    this.doClear = this.doClear.bind( this );
    this.doChange = this.doChange.bind( this );
    
    const shadowRoot = this.attachShadow( {mode: 'open'} );
    shadowRoot.appendChild( template.content.cloneNode( true ) );    

    this.$input = shadowRoot.querySelector( 'input' );
    this.$input.addEventListener( 'keyup', this.doChange );

    this.$clear = shadowRoot.querySelector( 'button' );
    this.$clear.addEventListener( 'click', this.doClear );
  }

  connectedCallback() {
    this.placeholder = this.hasAttribute( 'placeholder' ) === false ? 'Search' : this.placeholder;
  }

  doChange( evt ) {
    if( this.$input.value.trim().length === 0 ) {
      this.$clear.style.display = 'none';
    } else {
      this.$clear.style.display = 'block';
    }
  }

  doClear( evt ) {
    this.$input.value = '';
    this.$clear.style.display = 'none';

    this.dispatchEvent( new CustomEvent( 'clear' ) );
  }

  static get observedAttributes() {
    return [
      'placeholder',
      'value'
    ];
  }
  
  attributeChangedCallback( name, old, value ) {  
    this.$input.placeholder = this.placeholder === null ? null : this.placeholder;
  }

  get placeholder() {
    if( this.hasAttribute( 'placeholder' ) ) {
      return this.getAttribute( 'placeholder' );
    }

    return null;    
  }

  set placeholder( value ) {
    if( value !== null ) {
      this.setAttribute( 'placeholder', value );
    } else {
      this.removeAttribute( 'placeholder' );
    }    
  }  

  get value() {
    return this.$input.value;
  }

  set value( term ) {
    if( term !== null ) {
      this.$input.value = term;
    } else {
      this.$input.value = '';
    }
  }
}

window.customElements.define( 'avocado-search', Search );
