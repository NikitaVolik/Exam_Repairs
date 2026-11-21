import { useEffect, useState } from "react";
import { api } from "./api.js";

export default function Review({ item }) {
  const [review, setReview] = useState(null)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState({})

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')
    setFields({})
    setReview(null)
    setComment('')
    setRating('')
    setEditing(false)

    api(`/items/${item.id}/review`).then(data => { if (active) setReview(data) })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    
    return () => {
      active = false
    }
  }, [item.id])

  function edit() {
    setComment(review.comment)
    setRating(review.rating === null ? '' : String(review.rating))
    setFields({})
    setError('')
    setEditing(true)
  }

  async function submit(event) {
    event.preventDefault()

    if (saving) return

    const text = comment.trim()
    const nextFields = {}

    if (text.length < 5 || text.length > 500) {
      nextFields.comment = "Введите от 5 до 500 символов"
    }

    if (!['1', '2', '3', '4', '5'].includes(rating)) {
      nextFields.rating = "Выберите целую оценку от 1 до 5"
    }

    setFields(nextFields)
    setError('')

    if (Object.keys(nextFields).length) return

    setSaving(true)
    
    try {
      const data = await api(`/items/${item.id}/review`, {
        method: review ? 'PUT' : 'POST',
        body: JSON.stringify({ comment: text, rating: Number(rating) })
      })

      setReview({ comment: data.comment, rating: data.rating })
      setEditing(false)
    } catch (err) {
      setError(err.message)
      setFields(err.fields || {})
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p>Загрузка отзыва...</p>
    )
  }

  const allowed = item.status === 'completed'

  return (
    <div className="stack">
      {error && <p className="form-error" role="alert">{error}</p>}
      {review && !editing && ( 
        <>
          <p>Ваш отзыв: {review.comment}</p>
          <p>{review.rating == null ? 'Оценка не указана' : `Оценка: ${review.rating} из 5`}</p>
          {allowed && <button type="button" className="btn" onClick={edit}>
            Редактировать
          </button>}
        </>
      )}
      {allowed && (!review || editing) && (
        <form className="stack" onSubmit={submit} noValidate>
          <label className="field">
            <span>Отзыв</span>
            <textarea
              value={comment}
              onChange={event => setComment(event.target.value)}
              required
              minLength={5}
              maxLength={500}
              disabled={saving}
              aria-invalid={Boolean(fields.comment)}
            />
            {fields.comment && <small className="field-error" role="alert">
              {fields.comment}
            </small>}
          </label>
          <label className="field">
            <span>Оценка</span>
            <select
              value={rating}
              onChange={event => setRating(event.target.value)}
              required
              disabled={saving}
              aria-invalid={Boolean(fields.rating)}
            >
              <option value="" disabled hidden>Выберите оценку</option>
              {['1', '2', '3', '4', '5'].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            {fields.rating && <small className="field-error" role="alert">
              {fields.rating}
            </small>}
          </label>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить отзыв"}
          </button>
          {review && <button type="button" className="btn" disabled={saving} onClick={() => setEditing(false)}>
            Отмена
          </button>}
      </form>
      )}
      {!allowed && <small>Отзыв доступен после завершения заявки.</small>}
    </div>
  )
}