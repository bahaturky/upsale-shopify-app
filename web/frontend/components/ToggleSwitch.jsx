const ToggleSwitch = ({ options, selected, onChange }) => {
  const buttons = options.map((option, i) =>
    <div
      className="rounded-md px-6 py-4 flex items-center justify-center"
      key={i}
      style={{
        backgroundColor: selected === option.value ? '#e0e5f2' : 'transparent'
      }}
      onClick={() => onChange(option.value)}
    >
      {option.children || <img className="h-8" src={`/img/${option.icon}.svg`} />}
    </div>
  );

  return (
    <div
      className="toggle-switch rounded-md px-6 py-4 bg-gray-100 flex text-center cursor-pointer grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${ options.length }, minmax(0, 1fr))`
      }}
    >
      {buttons}
    </div>
  );
};

export default ToggleSwitch;
