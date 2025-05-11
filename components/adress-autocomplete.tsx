'use client'
import { useState, useEffect } from 'react'

type Suggestion = {
  display_name: string
  lat: string
  lon: string
}

export default function AddressAutocomplete({
  onSelect,
}: {
  onSelect: (suggestion: Suggestion) => void
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([])
        return
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5&countrycodes=ar`
      )
      const data = await res.json()
      setSuggestions(data)
    }

    const timeoutId = setTimeout(fetchSuggestions, 300) // debounce
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.display_name)
    setSuggestions([])
    setIsOpen(false)
    onSelect(suggestion)
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        placeholder="Ingresá tu domicilio"
        className="w-full border border-gray-300 px-4 py-2 rounded"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}