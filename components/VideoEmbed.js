export default function VideoEmbed({ url }) {
  if (!url) return null

  let embedUrl = ''

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  if (ytMatch) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`
  }

  // VK Video
  const vkMatch = url.match(/vk\.com\/video(-?\d+)_(\d+)/)
  if (vkMatch) {
    embedUrl = `https://vk.com/video_ext.php?oid=${vkMatch[1]}&id=${vkMatch[2]}`
  }

  // Rutube
  const rtMatch = url.match(/rutube\.ru\/video\/([a-f0-9]+)/)
  if (rtMatch) {
    embedUrl = `https://rutube.ru/play/embed/${rtMatch[1]}`
  }

  if (!embedUrl) return null

  return (
    <div className="aspect-video rounded-2xl overflow-hidden bg-gray-900">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
