import React, { useState } from 'react';

export default function useInputValues<
  T extends {
    [key: string]: string | number;
  }
>(init?: T) {
  const [inputValues, setInputValues] = useState<T>(init || ({} as T));

  function handleInputChange(e: React.FormEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget;
    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSelectChange(e: React.FormEvent<HTMLSelectElement>) {
    const { name } = e.currentTarget;
    const { value } = e.target as HTMLOptionElement;
    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetInputValues() {
    setInputValues(init || ({} as T));
  }

  return {
    inputValues,
    setInputValues,
    handleInputChange,
    handleSelectChange,
    resetInputValues,
  };
}
