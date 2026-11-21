import { useState } from "react";
import { api } from "./api.js";

export default function NewItemPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    visit_date: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function change(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
    setMessage('')
  }

  async function submit(event) {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setError('')
    setMessage('')
    
    try {
      const data = await api('/items', {
        method: 'POST',
        body: JSON.stringify(form)
      })

      setForm({
        title: '',
        description: '',
        address: '',
        visit_date: ''
      })
      setMessage(`${data.message}. Номер: ${data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <h1>Новая заявка</h1>
      <form className="card stack" onSubmit={submit}>
        <label className="field">
          <span>Вид техники</span>
          <select
            name="title"
            value={form.title}
            onChange={change}
            required
            disabled={saving}
          >
            <option value="" disabled hidden>Выберите вид техники</option>
            <option value="Стиральная машина">Стиральная машина</option>
            <option value="Пылесос">Пылесос</option>
            <option value="Кофемашина">Кофемашина</option>
          </select>
        </label>
        <label className="field">
          <span>Описание</span>
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            required
            minLength={10}
            maxLength={300}
            disabled={saving}
          />
        </label>
        <label className="field">
          <span>Адрес выезда</span>
          <input
            name="address"
            value={form.address}
            onChange={change}
            required
            maxLength={500}
            disabled={saving}
          />
        </label>
        <label className="field">
          <span>Дата визита</span>
          <input
            name="visit_date"
            value={form.visit_date}
            placeholder="ДД.ММ.ГГГГ"
            onChange={change}
            required
            maxLength={10}
            disabled={saving}
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-message" role="status">{message} <a href="/">Мои заявки</a></p>}
        <button className="btn" disabled={saving}>
          {saving ? "Сохранение.." : "Добавить"}
        </button>
      </form>
    </>
  )
}