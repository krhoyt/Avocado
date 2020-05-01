export default {
  async browse( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/note/developer/${id}`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  },
  async create( token, note ) {
    return await fetch( `${process.env.VUE_APP_API}/note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( note )
    } )
    .then( ( response ) => response.json() );
  },
  async update( token, note ) {
    return await fetch( `${process.env.VUE_APP_API}/note/${note.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Avocado': token
      },
      body: JSON.stringify( note )
    } )
    .then( ( response ) => response.json() );
  },
  async remove( token, id ) {
    return await fetch( `${process.env.VUE_APP_API}/note/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  }      
}
