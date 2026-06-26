/** Population person icon — matches Lesson 1 country explorer (CountryModel). */
export default function PersonIcon({
  color,
  height = 18,
}: {
  color: string;
  height?: number;
}) {
  const width = (height * 13) / 18;
  return (
    <svg width={width} height={height} viewBox="0 0 13 18" fill={color} aria-hidden>
      <circle cx="6.5" cy="3.5" r="3.2" />
      <path d="M6.5 7.5c-2.6 0-4.5 1.9-4.5 4.6V18h9v-5.9c0-2.7-1.9-4.6-4.5-4.6z" />
    </svg>
  );
}
