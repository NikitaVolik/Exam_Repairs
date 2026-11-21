import { useEffect, useState } from "react";
import { api } from "./api.js";

export default function Review({ item }) {
  const [review, setReview] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api(`/items/${item.id}/review`).then(data => { if (active) setReview(data) })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    
    return () => {
      active = false
    }
  }, [item.id])

  async function submit(event) {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setError('')
    
    try {
      const data = await api(`/items/${item.id}/review`, {
        method: 'POST',
        body: JSON.stringify({ comment })
      })

      setReview({ comment: data.comment })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p>Загрузка отзыва...</p>
    )
  }

  if (review) {
    return (
      <p role="status">Ваш отзыв: {review.comment}</p>
    )
  }

  return (
    <div className="stack">
      {error && <p className="form-error" role="alert">{error}</p>}
      {item.status === 'completed' ? <form className="stack" onSubmit={submit}>
        <label className="field">
          <span>Отзыв</span>
          <textarea
            value={comment}
            onChange={event => setComment(event.target.value)}
            required
            maxLength={1000}
            disabled={saving}
          />
        </label>
        <button className="btn" disabled={saving}>
          {saving ? "Сохранение..." : "Сохранить отзыв"}
        </button>
      </form> : <small>Отзыв доступен после завершения записи.</small>}
    </div>
  )
}