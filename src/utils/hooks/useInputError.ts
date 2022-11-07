import React, { useState } from 'react';
import { dynamicValidation } from '../formValidation';

export default function useInputError(inputNames: string[]) {
  const [inputError, setInputError] = useState(
    () =>
      inputNames.reduce((acc: { [key: string]: string }, curr: string) => {
        acc[curr] = '';
        return acc;
      }, {}) // turn inputNames into object keys
  );

  function validateInput(el: HTMLInputElement) {
    const validationStatus = dynamicValidation(el);

    const value = validationStatus.error ? validationStatus.error : '';
    setInputError((prev) => ({
      ...prev,
      [el.name]: value,
    }));

    return !validationStatus.error;
  }

  async function submitForm(
    e: React.FormEvent<HTMLFormElement>,
    submitAction: (() => Promise<void>) | (() => void),
    cleanUp: () => void
  ) {
    e.preventDefault();

    const {
      currentTarget: { elements }, // destructure e to get elements
    } = e;

    let errors = false;
    for (const fname of inputNames) {
      // iterate through each input field and validate
      const currEl = elements.namedItem(fname);
      if (!(currEl instanceof HTMLInputElement)) {
        continue;
      }
      const valid = validateInput(currEl);
      if (!valid) errors = true;
    }

    if (errors) return;
    await submitAction();
    cleanUp();
  }

  return { inputError, validateInput, submitForm };
}
