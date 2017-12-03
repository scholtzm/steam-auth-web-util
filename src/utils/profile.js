const LOCALSTORAGE_KEY = 'sawu-profiles';

function load(index = -1) {
  try {
    const savedStateString = localStorage.getItem(LOCALSTORAGE_KEY);
    const savedState = JSON.parse(savedStateString);

    if(index === -1) {
      return savedState;
    } else {
      return savedState[index];
    }

  } catch (error) {
    return null;
  }
}

function save(name, formData) {
  const existingProfiles = load();

  if(existingProfiles == null) {
    const profiles = [{
      name,
      formData
    }];

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(profiles));
    return 0;
  } else {
    const existingProfileIndex = existingProfiles.map(p => p.name).indexOf(name);
    if(existingProfileIndex !== -1) {
      existingProfiles.splice(existingProfileIndex, 1);
    }

    const newLength = existingProfiles.push({name, formData});
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(existingProfiles));
    return newLength - 1;
  }
}

function clear(index = -1) {
  if(index === -1) {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  } else {
    const profiles = load();

    if(profiles == null) {
      return;
    }

    profiles.splice(index, 1);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(profiles));
  }
}

export default {
  load,
  save,
  clear
}
