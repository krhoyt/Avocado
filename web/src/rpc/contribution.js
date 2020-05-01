export default {
  async browse( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/contribution/developer/${id}`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  },
  async create( token, record ) {
    return await fetch( `${process.env.VUE_APP_API}/contribution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( record )
    } )
    .then( ( response ) => response.json() );    
  },
  async remove( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/contribution/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );    
  },
  async update( token, item ) {
    return await fetch( `${process.env.VUE_APP_API}/contribution/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( item )
    } )
    .then( ( response ) => response.json()  );
  },  
  async updateRoles( token, id, roles ) {
    return await fetch( `${process.env.VUE_APP_API}/contribution/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( roles )
    } )
    .then( ( response ) => response.json()  );    
  },
  async removeRoles( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/contribution/${id}/role`, {
      method: 'DELETE',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  }
}
