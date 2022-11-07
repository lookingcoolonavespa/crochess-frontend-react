import React, { useState } from 'react';

export default function useInputValues(init?: {
  [key: string]: string | number;
}) {
  const [inputValues, setInputValues] = useState<{
    [key: string]: string | number;
  }>(init || {});

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
    setInputValues(init || {});
  }

  return {
    inputValues,
    setInputValues,
    handleInputChange,
    handleSelectChange,
    resetInputValues,
  };
}
