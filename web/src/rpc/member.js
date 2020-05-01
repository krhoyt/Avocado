export default {
  async browse( token ) {
    return await fetch( `${process.env.VUE_APP_API}/developer?private=true`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  },
  async create( token, record ) {
    return await fetch( `${process.env.VUE_APP_API}/developer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( record )
    } )
    .then( ( response ) => response.json() );
  },
  async modelUpdate( token, id, model, values ) {
    return await fetch( `${process.env.VUE_APP_API}/developer/${id}/${model}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( values )
    } )
    .then( ( response ) => response.json() );    
  },  
  async read( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/developer/${id}`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );    
  },
  async remove( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/developer/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );    
  },
  async social( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/developer/${id}/social`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );    
  },
  async update( token, record ) {
    return await fetch( `${process.env.VUE_APP_API}/developer/${record.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( record )
    } )
    .then( ( response ) => response.json() );
  }
}
