class DataTable extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' )
    template.innerHTML = `
      <style>
        :host {
          background-color: #f4f4f4;
          display: flex;
          flex-direction: column;
        }

        div {
          background: #e0e0e0;
          display: flex;
          flex-direction: row;
          height: 47px;
        }

        ul {
          flex-basis: 0;
          flex-grow: 1;
          margin: 0;
          overflow: scroll;
          padding: 0;
        }

        li {
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
        }

        li:hover {
          background-color: #e0e0e0;
        }

        li p {
          box-sizing: border-box;
          color: #161616;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          height: 47px;
          line-height: 47px;
          margin: 0;
          padding: 0 16px 0 16px;
        }

        li p.truncated {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;          
        }

        li.selected {
          background-color: #e0e0e0;
        }
      </style>
      <div>
        <slot></slot>
      </div>
      <ul></ul>
    `;

    this._data = [];

    this.doClick = this.doClick.bind( this );

    const shadowRoot = this.attachShadow( {mode: 'open'} );
    shadowRoot.appendChild( template.content.cloneNode( true ) );    

    this.$header = shadowRoot.querySelector( 'div' );
    this.$list = shadowRoot.querySelector( 'ul' );
  }

  doClick( evt ) {
    this.selected = evt.currentTarget.getAttribute( 'data-index' );

    const index = parseInt( this.selected );
    this.dispatchEvent( new CustomEvent( 'change', {
      detail: {
        index: index,
        data: this._data[index]
      }
    } ) );
  }

  static get observedAttributes() {
    return [
      'grow',
      'headerless',
      'selected'
    ];
  }

  attributeChangedCallback( name, old, value ) {  
    this.style.flexBasis = this.grow > 0 ? 0 : '';
    this.style.flexGrow = this.grow;

    this.$header.style.display = this.headerless === false ? 'flex' : 'none';

    const index = this.selected;
    if( name === 'selected' ) {
      for( let r = 0; r < this.$list.children.length; r++ ) {
        if( r === index ) {
          this.$list.children[r].classList.add( 'selected' );
        } else {
          this.$list.children[r].classList.remove( 'selected' );
        }
      }
    }
  }

  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value;

    while( this.$list.children.length > 0 ) {
      this.$list.children[0].removeEventListener( 'click', this.doClick );
      this.$list.children[0].remove();
    }

    for( let d = 0; d < this._data.length; d++ ) {
      const row = document.createElement( 'li' );
      row.setAttribute( 'data-index', d );
      row.addEventListener( 'click', this.doClick );

      for( let c = 0; c < this.children.length; c++ ) {
        let cell = document.createElement( 'p' );

        cell.style.flexBasis = this.children[c].grow > 0 ? 0 : '';        
        cell.style.flexGrow = this.children[c].grow > 0 ? this.children[c].grow : '';
        cell.style.width = this.children[c].width !== null ? `${this.children[c].width}px` : '';
        cell.innerText = value[d][this.children[c].field];

        if( this.children[c].truncated ) {
          cell.classList.add( 'truncated' );
        }

        row.appendChild( cell );
      }

      this.$list.appendChild( row );
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

  get headerless() {
    return this.hasAttribute( 'headerless' );
  }

  set headerless( value ) {
    if( value !== null ) {
      if( value === 'false' ) {
        this.removeAttribute( 'headerless' );
      } else {
        this.setAttribute( 'headerless', '' );
      }
    } else {
      this.removeAttribute( 'headerless' );
    }
  }
  
  get selected() {
    if( this.hasAttribute( 'selected' ) ) {
      return parseInt( this.getAttribute( 'selected' ) );
    }

    return null;
  }

  set selected( value ) {
    if( value !== null ) {
      this.setAttribute( 'selected', value );
    } else {
      this.removeAttribute( 'selected' );
    }
  }  
}

window.customElements.define( 'avocado-table', DataTable );
