import pool from "../Config/DataBase.js";

export const getUserByIdService = async (id) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const getUserByMailService = async (mail) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE mail = $1",
    [mail]
  );
  return result.rows[0];
};

export const createUserService = async (
  name,
  first_name,
  phone_number,
  mail,
  hashedPassword,
) => {

  const result = await pool.query(
    `INSERT INTO users (name, first_name, phone_number, mail, password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, first_name, phone_number, mail, hashedPassword]
  );
  return result.rows[0];
};

export const updateUserProfileService = async (id, fields) => {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (fields.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(fields.name); }
  if (fields.first_name !== undefined) { setClauses.push(`first_name = $${idx++}`); values.push(fields.first_name); }
  if (fields.phone_number !== undefined) { setClauses.push(`phone_number = $${idx++}`); values.push(fields.phone_number); }
  if (fields.mail !== undefined) { setClauses.push(`mail = $${idx++}`); values.push(fields.mail); }
  if (fields.avatar !== undefined) { setClauses.push(`avatar = $${idx++}`); values.push(fields.avatar); }

  if (setClauses.length === 0) return null;

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, name, first_name, phone_number, mail, avatar`,
    values
  );
  return result.rows[0];
};