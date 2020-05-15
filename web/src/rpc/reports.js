export default {
  async orbit( account ) {
    return await fetch( `/data/orbit-${account}.json` )
    .then( ( response ) => response.json() );
  }
}
