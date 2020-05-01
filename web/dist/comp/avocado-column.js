class DataTableColumn extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' )
    template.innerHTML = `
      <style>
        p {
          box-sizing: border-box;          
          color: #161616;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          height: 47px;
          line-height: 47px;
          margin: 0;
          min-width: 100px;
          padding: 0 16px 0 16px;
        }

        p:hover {
          background-color: red;
        }
      </style>
      <p>
        <slot></slot>
      </p>
    `;

    const shadowRoot = this.attachShadow( {mode: 'open'} );
    shadowRoot.appendChild( template.content.cloneNode( true ) );    
  }

  static get observedAttributes() {
    return [
      'field',
      'grow',
      'width'
    ];
  }

  connectedCallback() {
    this.field = this.hasAttribute( 'field' ) === false ? 'label' : this.field;        
  }

  attributeChangedCallback( name, old, value ) {  
    this.style.flexBasis = this.grow > 0 ? 0 : '';
    this.style.flexGrow = this.grow;
    this.style.width = this.width === 0 ? '' : `${this.width}px`;
  }

  get field() {
    if( this.hasAttribute( 'field' ) ) {
      return this.getAttribute( 'field' );
    }

    return null;
  }

  set field( value ) {
    if( value !== null ) {
      this.setAttribute( 'field', value );
    } else {
      this.removeAttribute( 'field' );
    }
  }

  get grow() {
    if( this.hasAttribute( 'grow' ) ) {
      return parseInt( this.getAttribute( 'grow' ) );
    }

    return null;
  }

  set grow( value ) {
    if( value !== null ) {
      this.setAttribute( 'grow', value );
    } else {
      this.removeAttribute( 'grow' );
    }
  }

  get truncated() {
    return this.hasAttribute( 'truncated' );
  }

  set truncated( value ) {
    if( value !== null ) {
      if( value === 'false' ) {
        this.removeAttribute( 'truncated' );
      } else {
        this.setAttribute( 'truncated', '' );
      }
    } else {
      this.removeAttribute( 'truncated' );
    }
  }

  get width() {
    if( this.hasAttribute( 'width' ) ) {
      return parseInt( this.getAttribute( 'width' ) );
    }

    return null;
  }

  set width( value ) {
    if( value !== null ) {
      this.setAttribute( 'width', value );
    } else {
      this.removeAttribute( 'width' );
    }
  }  
}

window.customElements.define( 'avocado-column', DataTableColumn );
