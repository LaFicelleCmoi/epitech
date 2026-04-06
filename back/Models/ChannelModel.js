import pool from "../Config/DataBase.js";

export const getChannelByIdService = async (channelId) => {
  const result = await pool.query(
    `SELECT *
    FROM channels
    WHERE id = $1`,
    [channelId]
  );
  
  return result.rows[0];
};

export const deleteChannelByIdService = async (channelID) => {
  const result = await pool.query(
    `DELETE FROM channels
    WHERE id = $1`,
    [channelID]
  );
  return result.rowCount;
};

export const updateChannelByIdService = async (channelId, name) => {
  const result = await pool.query(
    `UPDATE channels
     SET name = $1
     WHERE id = $2
     RETURNING *`,
    [name, channelId]
  );
  return result.rows[0];
}; 