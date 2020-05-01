export default {
  async orbit( token ) {
    return await fetch( `${process.env.VUE_APP_API}/reports/orbit`, {
      method: 'GET',
      headers: {
        'X-Avocado': token
      }
    } )
    .then( ( response ) => response.json() );
  }
}
