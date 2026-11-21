import { db } from "./db.js";

export function addReviewRoutes(app, auth) {
  const path = "/api/items/:id/review"

  app.get(path, auth, async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Некорректный идентификатор заявки" })
    }

    const [items] = await db.query(
      `SELECT user_id FROM items WHERE id = ?`,
      [id]
    )

    if (items.length === 0) {
      return res.status(404).json({ message: "Заявка не найдена" })
    }

    if (items[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Это чужая заявка" })
    }

    const [rows] = await db.query(
      `SELECT comment, rating FROM reviews WHERE item_id = ?`,
      [id]
    )

    res.json(rows[0] || null)
  })

  async function save(req, res) {
    const id = Number(req.params.id)
    const body = req.body || {}
    
    const comment = typeof body.comment === "string" ? body.comment.trim() : ""
    const rating = body.rating
    const errors = {}

    if (comment.length < 5 || comment.length > 500) {
      errors.comment = "Введите от 5 до 500 символов"
    }

    if (!Number.isSafeInteger(rating) || rating < 1 || rating > 5) {
      errors.rating = "Выберите целую оценку от 1 до 5"
    }

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Некорректный идентификатор заявки" })
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Проверьте поля", errors })
    }

    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      const [items] = await connection.query(
        `SELECT user_id, status FROM items WHERE id = ? FOR UPDATE`,
        [id]
      )

      if (items.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Заявка не найдена" })
      }

      if (items[0].user_id !== req.user.id) {
        await connection.rollback()
        return res.status(403).json({ message: "Это чужая заявка" })
      }

      if (items[0].status !== 'completed') {
        await connection.rollback()
        return res.status(403).json({ message: "Заявка ещё не завершена" })
      }

      const [reviews] = await connection.query(
        `SELECT id FROM reviews WHERE item_id = ?`,
        [id]
      )
      
      const creating = req.method === "POST"

      if (creating && reviews.length) {
        await connection.rollback()
        return res.status(409).json({ message: "Отзыв уже существует" })
      }

      if (!creating && reviews.length === 0) {
        await connection.rollback()
        return res.status(403).json({ message: "Отзыв не найден" })
      }

      if (creating) {
        await connection.query(
          `INSERT INTO reviews (item_id, comment, rating) VALUES (?, ?, ?)`,
          [id, comment, rating]
        )
      } else {
        await connection.query(
          `UPDATE reviews SET comment = ?, rating = ? WHERE item_id = ?`,
          [comment, rating, id]
        )
      }
      
      await connection.commit()

      res.status(creating ? 201 : 200).json({ comment, rating })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  app.post(path, auth, save)
  app.put(path, auth, save)
}