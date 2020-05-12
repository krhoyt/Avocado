export default {
  async browse( token ) {
    return await fetch( `${process.env.VUE_APP_API}/reach`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  },
  async create( token, item ) {
    return await fetch( `${process.env.VUE_APP_API}/reach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( item )
    } )
    .then( ( response ) => response.json() );
  },
  async update( token, item ) {
    return await fetch( `${process.env.VUE_APP_API}/reach/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( item )
    } )
    .then( ( response ) => response.json()  );
  },
  async remove( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/reach/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json()  );
  }
}
