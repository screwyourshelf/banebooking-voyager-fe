type Props = {
  værSymbol?: string | null;
  temperatur?: number | null;
  vind?: number | null;
  iconOnly?: boolean;
  compact?: boolean;
};

export default function WeatherInfo({
  værSymbol,
  temperatur,
  vind,
  iconOnly = false,
  compact = false,
}: Props) {
  const harVaer = !!værSymbol || typeof temperatur === "number" || typeof vind === "number";
  const harTemperatur = typeof temperatur === "number";
  const harVind = typeof vind === "number";

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

  if (compact) {
    return (
      <span className="weather-info weather-info--compact">
        {værSymbol ? (
          <img
            src={`${import.meta.env.BASE_URL}weather-symbols/svg/${værSymbol}.svg`}
            alt=""
            width={16}
            height={16}
            className="weather-info__icon select-none"
            draggable={false}
          />
        ) : null}
        {harTemperatur ? <span>{Math.round(temperatur)}°</span> : null}
      </span>
    );
  }

  return (
    <span className="weather-info">
      {værSymbol && (
        <img
          src={`${import.meta.env.BASE_URL}weather-symbols/svg/${værSymbol}.svg`}
          alt={værSymbol}
          width={16}
          height={16}
          className="weather-info__icon select-none"
          draggable={false}
        />
      )}
      {harTemperatur ? <span>{Math.round(temperatur)}°</span> : null}
      {harTemperatur && harVind ? (
        <span className="weather-info__separator" aria-hidden="true">
          ·
        </span>
      ) : null}
      {harVind ? <span>{Math.round(vind)} m/s</span> : null}
    </span>
  );
}
