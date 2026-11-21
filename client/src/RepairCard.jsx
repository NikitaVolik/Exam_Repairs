const imageNames = new Map([
  ["Стиральная машина", "washer"],
  ["Пылесос", "vacuum"],
  ["Кофемашина", "coffee"]
])

export default function RepairCard({ item, children }) {
  const imageName = imageNames.get(item.title)
  const src = imageName ? "/images/" + imageName + ".webp" : null

  return (
    <article className="card stack">
      {src && (
        <img className="card-image" src={src} alt="" loading="lazy" />
      )}
      {children}
    </article>
  )
}