let champLayer = '';
const buildChampsMap = (filter) => {
  require(['esri/Map',
      'esri/views/MapView',
      'esri/geometry/Point',
      'esri/symbols/PictureMarkerSymbol',
      'esri/layers/GraphicsLayer',
      'esri/Graphic',
      'esri/widgets/Legend'
    ],
    (Map, MapView, Point, Symbol, GraphicsLayer, Graphic, Legend) => {

      const champsMap = new Map({
        basemap: 'gray-vector'
      });

      const champsView = new MapView({
        container: 'viewDiv',
        map: champsMap,
        zoom: 2,
        center: [10, 15] // longitude, latitude
      });

      champLayer = new GraphicsLayer({});

      const coordsArray = [];

      const champMarker = {
        type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
        url: '/map/champ-marker.png'
      };

      const removeLoadingDiv = () => {
        setTimeout(() => {
          setTimeout(() => {
            document.getElementsByClassName('loader')[0].style.display = 'none';
          }, 1000);
          document.getElementById('info-display').classList.add('fade-in');
          setTimeout(() => {
            document.getElementById('info-display').style.display = 'block';
          }, 1000);
          setTimeout(() => {
            document.getElementById('actions').style.visibility = 'visible';
          }, 1000);
          if (document.getElementById('actions').offsetWidth > 200) {
            document.getElementById('actions').style.minWidth = document.getElementById('actions').offsetWidth + 'px';
          }
        }, 500);
      }

      champsView.ui.add(document.getElementById('actions'), 'top-right');

      const build = async() => {

        let champCount = 0;
        const champs = await fetch('champions.json')
          .then((champs) => champs.json());
        for (c = 0; c < champs.length; c++) {
          const champ = champs[c];

          let includeChamp = false;
          if (filter == undefined) {
            includeChamp = true;
          }

          // if filtering, determine if champ should be included
          // get champRole by concatenating items in champ.roles array 
          let champRoles = '';
          for (i = 0; i < champ.roles.length; i++) {
            if ((filter != undefined) && (champ.roles[i] == filter)) includeChamp = true;
            champ.roles[i] = champ.roles[i].replace('WIoT', 'Watson IoT');
            champ.roles[i] = champ.roles[i].replace('Cloud I', 'Cloud Integration');
            champRoles += `${champ.roles[i]}, `
          }

          if (includeChamp) {
            const champName = champ.name;
            const champLocation = champ.location;
            const champImage = champ.image;
            const champLatitude = champ.latitude;
            const champLongitude = champ.longitude;
            const champCoords = `${champLatitude},${champLongitude}`;
            let dupCount = 0;

            for (i = 0; i < coordsArray.length; i++) {
              if (coordsArray[i] == champCoords) dupCount++;
            }
            coordsArray.push(champCoords);

            // check if champ is at lifetime status and filter out from champRole value
            champBadges = '';
            let lifetimeChamp = false; // boolean for lifetime champion status
            if (champRoles.indexOf('Lifetime') != -1) {
              lifetimeChamp = true;
              champBadges = 'Lifetime Achievement'
              champRoles = champRoles.replace('Lifetime, ', '')
            }
            champRoles = champRoles.slice(0, -2);

            let champPoint = {
              type: 'point',
              latitude: champLatitude,
              longitude: champLongitude
            };

            let champAtt = {
              Name: champName,
              Location: champLocation,
              Image: champImage,
              Area: champRoles
            };

            champMarker.height = 32;
            champMarker.width = 20;
            if (dupCount > 0) {
              champMarker.height += (3 + ((dupCount / 5) * .5))
              champMarker.width += (3 + ((dupCount / 5) * .5) * .625)
            }

            const fieldsContent = {
              type: 'fields',
              fieldInfos: [{
                  fieldName: 'Location'
                },
                {
                  fieldName: 'Area'
                }
              ]
            }

            imageContent = {
              type: 'media',
              mediaInfos: [{
                title: '',
                type: '',
                caption: '',
                value: {
                  sourceURL: champImage
                }
              }]
            };

            let badgeContent = {
              type: 'media',
              mediaInfos: [{
                title: '',
                type: '',
                caption: '',
                value: {
                  sourceURL: ''
                }
              }]
            };
            if (lifetimeChamp) {
              badgeContent = {
                type: 'media',
                mediaInfos: [{
                  title: '',
                  type: 'image',
                  caption: 'Lifetime Achievement Champion',
                  value: {
                    sourceURL: 'https://s3.us.cloud-object-storage.appdomain.cloud/developer-static-pages/en/champions/images/ChampionLifetimeAward.png'
                  }
                }]
              }
            }

            let champGraphic = new Graphic({
              geometry: champPoint,
              symbol: champMarker,
              attributes: champAtt,
              popupTemplate: {
                title: '{Name}',
                content: [imageContent, fieldsContent, badgeContent]
              }
            });

            champCount++;
            champLayer.add(champGraphic);

          }
        }
        if (filter == undefined) {
          document.getElementById('info').innerHTML = `Showing all ${champCount} IBM Champions`;
        } else if (filter == 'Lifetime') {
          document.getElementById('info').innerHTML = `Showing ${champCount} IBM Champions with the Lifetime Achievement badge`;
        } else {
          filter = filter.replace('WIoT', 'Watson IoT');
          filter = filter.replace('Cloud I', 'Cloud Integration');
          document.getElementById('info').innerHTML = `Showing ${champCount} IBM Champions in the ${filter} area`;
        }
        removeLoadingDiv();
        champsMap.add(champLayer);
      }
      build();
    });
}
buildChampsMap();

document.addEventListener('DOMContentLoaded', () => {

  const filterChamps = id => {
    document.getElementsByClassName('loader')[0].style.display = 'block';
    document.getElementById('info-display').style.display = 'none';
    buildChampsMap(id.target.value);
  };

  const buildChampsFilter = async() => {
    filterList = document.getElementById('filterList');
    filterIds = ['lifetime']
    const roles = await fetch('roles.json')
      .then((roles) => roles.json());
    for (r = 0; r < roles.length; r++) {
      let role = roles[r];
      let id = role.replace(/ |\&|@|!|%|\(|\)|\+|\?|,|\.|\\|\/=/g, '').toLowerCase();
      filterIds.push(id);
      let liNode = document.createElement('LI');
      let inputNode = document.createElement('INPUT');
      inputNode.setAttribute('type', 'radio');
      inputNode.setAttribute('id', id);
      inputNode.setAttribute('name', 'filter');
      inputNode.setAttribute('value', role);
      let labelNode = document.createElement('LABEL');
      labelNode.setAttribute('for', id);
      role = role.replace('Lifetime', 'Lifetime champions');
      role = role.replace('WIoT', 'Watson IoT');
      role = role.replace('Cloud I', 'Cloud Integration');
      let labelText = document.createTextNode(role);
      labelNode.appendChild(labelText);
      liNode.appendChild(inputNode);
      liNode.appendChild(labelNode);
      filterList.appendChild(liNode);
      inputNode.onclick = filterChamps;
    }
  };

  const filterContainer = document.getElementById('filterContainer');
  const clearBtn = document.getElementById('clear');
  const filterToggle = document.getElementById('filterToggle');

  const clearFilter = () => {
    document.getElementsByClassName('loader')[0].style.display = 'block';
    document.getElementById('info-display').style.display = 'none';
    buildChampsMap(undefined);
    let radios = document.querySelectorAll('[name="filter"]');
    for (i = 0; i < radios.length; i++) {
      radios[i].checked = false;
    }
  }

  const toggleFilter = () => {
    if (filterContainer.style.display === 'none') {
      filterContainer.style.display = 'block';
      filterToggle.classList.add('showing');
    } else {
      filterContainer.style.display = 'none';
      filterToggle.classList.remove('showing');
    }
  }

  clearBtn.addEventListener('click', clearFilter);
  filterToggle.addEventListener('click', toggleFilter)
  buildChampsFilter();

});