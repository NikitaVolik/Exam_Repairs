import { useEffect, useState } from "react";
import { api } from "./api.js";
import { statusLabel } from "./statuses.js";
import Review from "./Review.jsx";

export default function Dashboard({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api('/items').then(data => { if (active) setItems(data) })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <h1>Личный кабинет</h1>
      <p>Пользователь: {user.login}</p>
      <div className="row">
        <h2>Мои заявки</h2>
        <a href="/">Обновить список</a>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p>Заявок пока нет. <a href="/new">Добавить заявку</a></p>
      )}
      <div className="grid cols-2">
        {items.map(item => (
          <article key={item.id} className="card stack">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>{item.address}</p>
            <p>{item.visit_date}</p>
            <p>Статус: {statusLabel(item.status)}</p>
            <Review item={item} />
          </article>
        ))}
      </div>
    </>
  )
}