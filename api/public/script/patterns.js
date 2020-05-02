// Constants
const PATTERNS_API = '/data/patterns.json';

// Application
class Patterns {
  constructor() {
    // Private properties
    // Original data
    // Filtered data (search)
    // Statistics
    this._average = {};
    this._data = [];
    this._filtered = [];
    this._median = {};

    // Removable event handlers
    this.doSearch = this.doSearch.bind( this );
    this.doSelect = this.doSelect.bind( this );

    // Element references
    this.$calculate = document.querySelector( 'select' );
    this.$calculate.addEventListener( 'change', this.doSearch );
    this.$footers = document.querySelectorAll( 'div.footer' );    
    this.$list = document.querySelector( 'div.list' );
    this.$search = document.querySelector( 'avocado-search' );
    this.$search.addEventListener( 'keyup', this.doSearch );
    this.$search.addEventListener( 'clear', this.doSearch );

    // Load and display pattern data
    fetch( PATTERNS_API )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      this._data = data.slice();
      this._filtered = this._data.slice();
      
      this.calculate( this._data );
      this.render();
    } );
  }

  // Search filtering
  doSearch( evt ) {
    this._filtered = this._data.filter( ( item ) => {
      if( item.name.indexOf( this.$search.value ) >= 0 ) {
        return true;  
      }

      return false;
    } );

    if( parseInt( this.$calculate.value ) === 0 ) {
      this.calculate( this._data );
    } else {
      this.calculate( this._filtered );
    }

    this.render();
  }

  // Handle selection
  doSelect( evt ) {
    const index = parseInt( evt.currentTarget.getAttribute( 'data-index' ) );

    for( let c = 0; c < this.$list.children.length; c++ ) {
      if( c === index ) { 
        this.$list.children[c].classList.add( 'selected' );
      } else {
        this.$list.children[c].classList.remove( 'selected' );
      }
    }
  }

  calculate( source ) {
    // Reset statistics
    this._average = {
      watchers: 0,
      stargazers: 0,
      forks: 0,
      issues: 0
    };
    this._median = {
      watchers: [],
      stargazers: [],
      forks: [],
      issues: []
    };

    // Calculate
    for( let s = 0; s < source.length; s++ ) {
      this._average.watchers = this._average.watchers + source[s].subscribers_count;
      this._average.stargazers = this._average.stargazers + source[s].stargazers_count;
      this._average.forks = this._average.forks + source[s].forks_count;
      this._average.issues = this._average.issues + source[s].open_issues_count;

      this._median.watchers.push( source[s].subscribers_count );
      this._median.stargazers.push( source[s].stargazers_count );
      this._median.forks.push( source[s].forks_count );
      this._median.issues.push( source[s].open_issues_count );
    }

    // Averages
    this._average.watchers = Math.round( this._average.watchers / source.length );
    this._average.stargazers = Math.round( this._average.stargazers / source.length );
    this._average.forks = Math.round( this._average.forks / source.length );
    this._average.issues = Math.round(  this._average.issues / source.length );    

    // Median values
    // Sort
    // Select middle value
    this._median.watchers = this._median.watchers.sort( this.numeric );
    this._median.watchers = Math.round( this.middle( this._median.watchers ) );
    this._median.stargazers = this._median.stargazers.sort( this.numeric );
    this._median.stargazers = Math.round( this.middle( this._median.stargazers ) );
    this._median.forks = this._median.forks.sort( this.numeric );
    this._median.forks = Math.round( this.middle( this._median.forks ) );
    this._median.issues = this._median.issues.sort( this.numeric );
    this._median.issues = Math.round( this.middle( this._median.issues ) ); 
  }

  // Colorize based on deficit
  // Median generally lower than average
  // Consider value lower than median as worse resut
  colorize( column, value, average, median ) {
    if( value < average ) {
      column.style.backgroundColor = 'yellow';
    }

    if( value < median ) {
      column.style.backgroundColor = 'pink';
    }
  }

  // Select middle value
  // Array may be odd number in length
  middle( values ) {
    let result = values[Math.floor( values.length / 2 )];

    if( ( values.length % 2 ) === 0 ) {
      const low = values.length / 2;
      const high = low + 1;
      result = ( values[low] + values[high] ) / 2;
    }

    return result;
  }

  // Numeric sort
  numeric( a, b ) {
    if( a > b ) return 1;
    if( a < b ) return -1;
    return 0;
  }  

  render() {
    while( this.$list.children.length > 0 ) {
      this.$list.children[0].removeEventListener( 'click', this.doSelect );
      this.$list.children[0].remove();
    }

    // Set number of patterns
    this.$footers[0].children[0].innerText = `Showing ${this._filtered.length} patterns`;

    // TODO: Date last generated

    // Display averages
    this.$footers[1].children[2].innerText = this._average.watchers;
    this.$footers[1].children[3].innerText = this._average.stargazers;
    this.$footers[1].children[4].innerText = this._average.forks;
    this.$footers[1].children[5].innerText = this._average.issues;

    // Display medians
    this.$footers[0].children[2].innerText = this._median.watchers;
    this.$footers[0].children[3].innerText = this._median.stargazers;
    this.$footers[0].children[4].innerText = this._median.forks;
    this.$footers[0].children[5].innerText = this._median.issues;

    // Generate rows
    for( let f = 0; f < this._filtered.length; f++ ) {
      // Row
      const item = document.createElement( 'div' );
      item.classList.add( 'item' );
      item.setAttribute( 'data-index', f );
      item.addEventListener( 'click', this.doSelect );

      // Name
      const name = document.createElement( 'p' );
      name.innerText = this._filtered[f].name;
      item.appendChild( name );

      // Created at
      const created = document.createElement( 'p' );
      created.classList.add( 'medium' );
      created.innerText = dateFns.format(
        new Date( this._filtered[f].created_at ),
        'DD MMM YYYY'
      );
      item.appendChild( created );

      // Updated at
      const updated = document.createElement( 'p' );
      updated.classList.add( 'medium' );
      updated.innerText = dateFns.format(
        new Date( this._filtered[f].updated_at ),
        'DD MMM YYYY'
      );
      item.appendChild( updated );

      // Pushed at
      const pushed = document.createElement( 'p' );
      pushed.classList.add( 'medium' );
      pushed.innerText = dateFns.format(
        new Date( this._filtered[f].pushed_at ),
        'DD MMM YYYY'
      );
      item.appendChild( pushed );

      // Watchers
      const watchers = document.createElement( 'p' );
      watchers.classList.add( 'short' );
      this.colorize( 
        watchers,
        this._filtered[f].subscribers_count,
        this._average.watchers,
        this._median.watchers
      );
      watchers.innerText = this._filtered[f].subscribers_count;
      item.appendChild( watchers );

      // Stars
      const stars = document.createElement( 'p' );
      stars.classList.add( 'short' );
      this.colorize( 
        stars,
        this._filtered[f].stargazers_count,
        this._average.stargazers,
        this._median.stargazers
      );        
      stars.innerText = this._filtered[f].stargazers_count;
      item.appendChild( stars );

      // Forks
      const forks = document.createElement( 'p' );
      forks.classList.add( 'short' );
      this.colorize( 
        forks,
        this._filtered[f].forks_count,
        this._average.forks,
        this._median.forks
      );                
      forks.innerText = this._filtered[f].forks_count;
      item.appendChild( forks );

      // Issues
      const issues = document.createElement( 'p' );
      issues.classList.add( 'short' );
      issues.innerText = this._filtered[f].open_issues_count;
      item.appendChild( issues );

      // Append row to list
      this.$list.appendChild( item );
    }
  }
}

// Main
const application = new Patterns();
