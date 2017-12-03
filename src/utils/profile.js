const LOCALSTORAGE_KEY = 'sawu-keys';

function load() {
  try {
    const savedStateString = localStorage.getItem(LOCALSTORAGE_KEY);
    return JSON.parse(savedStateString);
  } catch (error) {
    return null;
  }
}

function save(formData) {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(formData));
}

function clear() {
  localStorage.removeItem(LOCALSTORAGE_KEY);
}

export default {
  load,
  save,
  clear
}
