import { useRef } from 'react';
import { FormProps } from '../types/interfaces';
import useInputError from '../utils/hooks/useInputError';

import FlatBtn from './FlatBtn';
import InputField from './InputField';
import Select from './Select';

import styles from '../styles/Form.module.scss';
import RadioList from './RadioList';

export default function Form({
  fields,
  inputValues,
  actionBtnText,
  noCancelBtn,
  cancelBtnText,
  handleInputChange,
  handleSelectChange,
  submitAction,
  cleanUp,
  close,
}: FormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fieldNames = fields.map((f) => f.name);
  const { inputError, validateInput, submitForm } = useInputError(fieldNames);

  return (
    <form
      ref={formRef}
      autoComplete="nope"
      onSubmit={async (e) => {
        cleanUp = cleanUp || close;
        await submitForm(e, submitAction, cleanUp);
      }}
      className={styles.main}
    >
      <div className="content">
        <input type="password" hidden />
        {/* need this to turn off autocomplete */}
        {fields.map((f, idx) => {
          switch (true) {
            case f.type === 'dropdown':
              return (
                <Select
                  key={idx}
                  onChange={handleSelectChange}
                  value={(inputValues[f.name] as string) || ''}
                  {...f}
                />
              );
            case f.type === 'radioList': {
              return (
                <RadioList
                  key={idx}
                  onChange={handleInputChange}
                  value={(inputValues[f.name] as string) || ''}
                  {...f}
                />
              );
            }
            case f.unitsDisplay !== undefined: {
              return (
                <div key={idx} className={styles.with_units}>
                  <InputField
                    autoFocus={idx === 0}
                    onBlur={(e: React.FormEvent<HTMLInputElement>) =>
                      validateInput(e.currentTarget)
                    }
                    error={inputError[f.name]}
                    onChange={(e) => {
                      validateInput(e.currentTarget as HTMLInputElement);
                      handleInputChange(e);
                    }}
                    value={inputValues[f.name] ?? ''}
                    {...f}
                  />
                  <Select
                    onChange={handleSelectChange}
                    value={
                      (inputValues[f.unitsDisplay?.name as string] as string) ||
                      ''
                    }
                    {...f.unitsDisplay}
                  />
                </div>
              );
            }
            default:
              return (
                <InputField
                  key={idx}
                  autoFocus={idx === 0}
                  onBlur={(e: React.FormEvent<HTMLInputElement>) =>
                    validateInput(e.currentTarget)
                  }
                  error={inputError[f.name]}
                  onChange={(e) => {
                    validateInput(e.currentTarget as HTMLInputElement);
                    handleInputChange(e);
                  }}
                  value={inputValues[f.name] || ''}
                  {...f}
                />
              );
          }
        })}
      </div>
      <footer>
        <div className={styles['btn-ctn']}>
          {!noCancelBtn && (
            <FlatBtn
              text={cancelBtnText || 'Cancel'}
              underline={true}
              onClick={close}
              size="small"
            />
          )}
          <FlatBtn
            type="submit"
            text={actionBtnText || 'Done'}
            filled={true}
            size="small"
          />
        </div>
      </footer>
    </form>
  );
}
