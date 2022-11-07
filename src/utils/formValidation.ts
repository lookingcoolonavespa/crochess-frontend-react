export function dynamicValidation(el: HTMLInputElement) {
  switch (el.name) {
    case 'time': {
      const val = el.value;
      if (typeof +val !== 'number') {
        return { error: 'not a number' };
      }
      if (!val || +val > 60) return { error: 'must be between 1 and 60' };
      break;
    }

    case 'increment': {
      const val = el.value;
      if (typeof +val !== 'number') {
        return { error: 'not a number' };
      }
      if (+val > 60) return { error: 'must be between 0 and 60' };
      break;
    }

    case 'color': {
      const val = el.value;
      if (val !== 'black' && val !== 'white') {
        return { error: 'not a valid color' };
      }
    }

    default:
      return { isValid: true };
  }

  return { isValid: true };
}
