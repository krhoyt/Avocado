import colors from './colors.js';
import languages from './languages.js';
import levels from './levels.js';
import organizations from './organizations.js';
import relationships from './relationships.js';
import roles from './roles.js';
import situations from './situations.js';
import skills from './skills.js';

export default {
  namespaced: true,
  state: {},
  modules: {
    colors,
    languages,
    levels,
    organizations,
    relationships,
    roles,
    situations,
    skills
  }
}
