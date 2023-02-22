
function localStorageAvailable (){
  var test = 'test';

  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);

    return true;
  } catch (e) {
    return false;
  }
}

export default {
  setItem: (key, value) => {
    if (!localStorageAvailable()) {
      if (!window.islandStorage) {
        window.islandStorage = {};
      }

      window.islandStorage[key] = value;

      return;
    }

    localStorage.setItem(key, value);
  },
  getItem: (key) => {
    if (!localStorageAvailable()) {
      if (!window.islandStorage) {
        return null;
      }

      return window.islandStorage[key];
    }

    return localStorage.getItem(key);
  },
  removeItem: (key) => {
    if (!localStorageAvailable()) {
      if (!window.islandStorage) {
        return;
      }

      delete window.islandStorage[key];

      return;
    }

    localStorage.removeItem(key);
  }
};