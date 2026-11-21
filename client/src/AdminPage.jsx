import { useEffect, useState } from "react";
import { api } from "./api.js";
import { statuses } from "./statuses.js";
import RepairCard from "./RepairCard.jsx";

export default function AdminPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('desc')
  const [page, setPage] = useState(1)
  const [savingId, setSavingId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true

    api('/admin/items').then(data => { if (active) setItems(data) })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    
    return () => {
      active = false
    }
  }, [])

  const query = search.trim().toLowerCase()
  const filtered = items.filter(item => {
    const matchesStatus = !status || item.status === status
    const matchesLogin = item.login.toLowerCase().includes(query)
    return matchesStatus && matchesLogin
  }).sort((a, b) => {
    const byLogin = a.login.localeCompare(b.login, undefined, { sensitivity: 'base' })
    const order = byLogin || a.id - b.id
    return sort === 'asc' ? order : -order
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / 4))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * 4, currentPage * 4)

  async function saveStatus(id, nextStatus) {
    if (savingId !== null) return

    setSavingId(id)
    setError('')
    setMessage('')
    
    try {
      await api(`/admin/items/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      })

      setItems(current => current.map(item => item.id == id ? { ...item, status: nextStatus } : item))
      setMessage(`Статус заявки № ${id} сохранён`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <h1>Администратор</h1>
      <div className="card row">
        <label className="field">
          <span>Фильтр по статусу</span>
          <select
            value={status}
            onChange={event => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="">Все статусы</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Поиск по логину</span>
          <input
            type="search"
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Введите логин или его часть"
          />
        </label>
        <label className="field">
          <span>Порядок заявок</span>
          <select
            value={sort}
            onChange={event => {
              setSort(event.target.value)
              setPage(1)
            }}
          >
            <option value="desc">Логин от Z до A</option>
            <option value="asc">Логин от A до Z</option>
          </select>
        </label>
        <a href="/admin">Обновить список</a>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && 
        <div className="notice row" role="status">
          <span>{message}</span>
          <button type="button" className="btn" onClick={() => setMessage('')}>
            Закрыть
          </button>
        </div>
      }

      {!loading && !error && filtered.length === 0 && (
        <p>Заявок не найдено</p>
      )}

      <div className="grid cols-2">
        {visible.map(item => (
          <RepairCard key={item.id} item={item}>
            <h2>Заявка № {item.id}</h2>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>Пользователь: {item.login}</p>
            <p>Адрес выезда: {item.address}</p>
            <p>Дата визита: {item.visit_date}</p>
            <label className="field">
              <span>Статус (сохраняется сразу)</span>
              <select
                value={item.status}
                disabled={savingId !== null}
                onChange={event => saveStatus(item.id, event.target.value)}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          </RepairCard>
        ))}
      </div>

      <nav className="row" aria-label="Страницы заявок">
        <button className="btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
          Назад
        </button>

        <span>{currentPage} / {totalPages}</span>

        <button className="btn" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
          Вперёд
        </button>
      </nav>
    </>
  )
}