import { FieldsInterface } from '../types/interfaces';

interface RadioListProps extends FieldsInterface {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

export default function RadioList({
  label,
  name,
  onChange,
  value,
  options,
}: RadioListProps) {
  return (
    <div id={name} className="form-group">
      <p className="label">{label}</p>
      <div className="radio-ctn">
        {options &&
          options.map((o, i) => (
            <div className="radio-wrapper" key={`${name}${i}`}>
              <input
                type="radio"
                id={`${name}${i}`}
                name={name}
                onChange={onChange}
                checked={value === o.value}
                {...o}
              />
              {o.display && <label htmlFor={`${name}${i}`}>{o.display}</label>}
            </div>
          ))}
      </div>
    </div>
  );
}
