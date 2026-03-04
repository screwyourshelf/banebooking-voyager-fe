type Props = {
  værSymbol?: string | null;
  temperatur?: number | null;
  vind?: number | null;
  iconOnly?: boolean;
};

export default function WeatherInfo({ værSymbol, temperatur, vind, iconOnly = false }: Props) {
  const harVaer = !!værSymbol || typeof temperatur === "number" || typeof vind === "number";

  if (!harVaer) return null;

  if (iconOnly) {
    return værSymbol ? (
      <img
        src={`${import.meta.env.BASE_URL}weather-symbols/svg/${værSymbol}.svg`}
        alt={værSymbol}
        width={16}
        height={16}
        className="select-none"
        draggable={false}
      />
    ) : null;
  }

  return (
    <span className="flex items-center gap-1">
      {værSymbol && (
        <img
          src={`${import.meta.env.BASE_URL}weather-symbols/svg/${værSymbol}.svg`}
          alt={værSymbol}
          width={16}
          height={16}
          className="select-none"
          draggable={false}
        />
      )}
      {typeof temperatur === "number" && <span>{temperatur}°C</span>}
      {typeof vind === "number" && <span>{vind} m/s</span>}
    </span>
  );
}
