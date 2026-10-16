export default function BackgroundPattern() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{
        backgroundImage: 'url(/patterns/medical-plus.svg)',
        backgroundSize: '30px 30px',
      }}
    />
  );
}
