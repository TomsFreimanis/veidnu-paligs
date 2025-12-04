export default function Toast({ message }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
      {message}
    </div>
  );
}
