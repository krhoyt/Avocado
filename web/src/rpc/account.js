export default {
  async browse() {
    return await fetch( 'https://insights-api.mybluemix.net/api/account' )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      data.unshift( {id: 'all', email: 'All Accounts'} );
      return data;
    } );
  },
  async login( email, password ) {
    return await fetch( 'https://insights-api.mybluemix.net/api/account/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( {
        email: email,
        password: password
      } )
    } )
    .then( ( response ) => response.json() );
  }
}
