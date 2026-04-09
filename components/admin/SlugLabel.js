export default function SlugLabel() {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-sm font-medium text-gray-700">URL (slug)</span>
      <div className="relative group">
        <button
          type="button"
          className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold leading-none flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
        >
          ?
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10">
          Человекочитаемая часть URL-адреса. Генерируется автоматически из
          названия. Например: «Волшебная палочка» → /products/волшебная-палочка
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
        </div>
      </div>
    </div>
  )
}
