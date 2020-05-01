const fetch = require('node-fetch');
const fs = require('fs');
const build = async() => {
  const deleteKeysArray = ["id", "created_at", "updated_at", "email", "description", "address", "city", "postal", "region", "public", "internal", "organizations", "languages", "skills", "notes", "contributions"]
  const rolesSet = new Set();
  let champsArray = new Array();
  const developers = await fetch('https://insights-api.mybluemix.net/api/developer', {
      method: 'GET',
      headers: {
        'X-Avocado': '56501805-8c6d-4296-a7b5-0ddf744b95ab'
      }
    })
    .then((developers) => developers.json());
  for (d = 0; d < developers.length; d++) {
    if (developers[d].location != null) {
      let developer = await fetch(`https://insights-api.mybluemix.net/api/developer/${developers[d].id}`, {
          method: 'GET',
          headers: {
            'X-Avocado': '56501805-8c6d-4296-a7b5-0ddf744b95ab'
          }
        })
        .then((developer) => developer.json());
      for (k = 0; k < deleteKeysArray.length; k++) {
        delete developer[deleteKeysArray[k]];
      }
      let roleNames = []
      let roles = developer.roles;
      for (r = 0; r < roles.length; r++) {
        rolesSet.add(roles[r].name);
        roleNames.push(roles[r].name);
      }
      developer.roles = roleNames;

      champsArray.push(developer)
    }
  }
  champsArray = champsArray.reverse();
  fs.writeFileSync('../public/map/champions.json', JSON.stringify(champsArray));
  fs.writeFileSync('../public/map/roles.json', JSON.stringify([...rolesSet].sort()));
}
build();