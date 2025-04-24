export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <svg
        className="w-16 h-16 animate-spin text-gray-200"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="4" />
      </svg>
    </div>
  )
}