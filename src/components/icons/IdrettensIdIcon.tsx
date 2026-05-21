export default function IdrettensIdIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="1.9 0 57 61"
      aria-hidden="true"
    >
      {/* Badge */}
      <path
        d="M56.71,11.35C56.71,5.72,52.11,.05,46.5,1.15L16.39,7.95c-5.23,1.44-9.31,4.04-10.21,10.21L1.93,49.48c0,5.64,4.57,10.21,10.21,10.21H48.2c5.64,0,10.21-4.57,10.21-10.21l-1.7-38.13Z"
        fill="#002147"
      />
      {/* "ID" tekst i badge */}
      <path d="M16.72,20.99h4.81v4.05h-4.81v-4.05Zm.12,5.83h4.57v16.1h-4.57s0-16.1,0-16.1Z" fill="#fff" />
      <path d="M26.18,21.89h8.2c6.61,0,11.17,4.54,11.17,10.45v.06c0,5.92-4.57,10.51-11.17,10.51h-8.2V21.89Zm4.63,4.17v12.67h3.57c3.78,0,6.34-2.55,6.34-6.28v-.06c0-3.72-2.55-6.34-6.34-6.34h-3.57Z" fill="#fff" />
    </svg>
  );
}
