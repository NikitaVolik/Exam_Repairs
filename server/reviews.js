import { db } from "./db.js";

export function addReviewRoutes(app, auth) {
  app.get("/api/items/:id/review", auth, async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Некорректный идентификатор записи" })
    }

    const [items] = await db.query(
      `SELECT user_id FROM items WHERE id = ?`,
      [id]
    )

    if (items.length === 0) {
      return res.status(404).json({ message: "Запись не найдена" })
    }

    if (items[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Это чужая запись" })
    }

    const [rows] = await db.query(
      `SELECT comment FROM reviews WHERE item_id = ?`,
      [id]
    )

    res.json(rows[0] || null)
  })

  app.post("/api/items/:id/review", auth, async (req, res) => {
    const id = Number(req.params.id)
    const body = req.body || {}
    
    const comment = typeof body.comment === "string" ? body.comment.trim() : ""

    if (!Number.isSafeInteger(id) || id <= 0 || !comment || comment.length > 1000) {
      return res.status(400).json({ message: "Проверьте номер записи и текст отзыва (до 1000 символов)" })
    }

    const [rows] = await db.query(
      `SELECT user_id, status FROM items WHERE id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "Запись не найдена" })
    }

    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Это чужая запись" })
    }

    if (rows[0].status !== 'completed') {
      return res.status(403).json({ message: "Запись ещё не завершена" })
    }

    try {
      const [result] = await db.query(
        `INSERT INTO reviews (item_id, comment)
        SELECT id, ? FROM items WHERE id = ? AND user_id = ? AND status = 'completed'`,
        [comment, id, req.user.id]
      )

      if (!result.affectedRows) {
        return res.status(409).json({ message: "Статус изменился. Обновите список." })
      }
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Отзыв уже существует" })
      }
      throw error
    }

    res.status(201).json({ comment, message: "Отзыв сохранён" })
  })
}