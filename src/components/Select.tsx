import { SelectOptionsInterface } from '../types/interfaces';

interface SelectProps {
  options?: SelectOptionsInterface[];
  name?: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Select({
  options,
  name,
  label,
  value,
  onChange,
}: SelectProps) {
  return (
    <div className="select-wrapper">
      {label && <label>{label}</label>}
      {options && (
        <select name={name} value={value} onChange={onChange}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.display}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
