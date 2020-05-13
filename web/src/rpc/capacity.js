export default {
  async browse( token ) {
    return await fetch( `${process.env.VUE_APP_API}/capacity`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  },
  async create( token, item ) {
    return await fetch( `${process.env.VUE_APP_API}/capacity`, {
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
    return await fetch( `${process.env.VUE_APP_API}/capacity/${item.id}`, {
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
    return await fetch( `${process.env.VUE_APP_API}/capacity/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json()  );
  },
  async entities( token ) {
    return await fetch( `${process.env.VUE_APP_API}/capacity/entities`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  },  
  async fields( token ) {
    return await fetch( `${process.env.VUE_APP_API}/capacity/fields`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  }  
}
