import pool from "../Config/DataBase.js";

// Auto-create friendships table
export const ensureFriendsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS friendships (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      requester_id UUID NOT NULL,
      addressee_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id),
      CONSTRAINT check_friend_status CHECK (status IN ('pending', 'accepted'))
    )
  `);
};

export const sendFriendRequestService = async (requesterId, addresseeId) => {
  // Check if a friendship already exists in either direction
  const existing = await pool.query(
    `SELECT * FROM friendships
     WHERE (requester_id = $1 AND addressee_id = $2)
        OR (requester_id = $2 AND addressee_id = $1)`,
    [requesterId, addresseeId]
  );
  if (existing.rows.length > 0) {
    return { existing: existing.rows[0] };
  }

  const result = await pool.query(
    `INSERT INTO friendships (requester_id, addressee_id, status)
     VALUES ($1, $2, 'pending') RETURNING *`,
    [requesterId, addresseeId]
  );
  return { created: result.rows[0] };
};

export const acceptFriendRequestService = async (friendshipId, userId) => {
  // Only the addressee can accept
  const result = await pool.query(
    `UPDATE friendships SET status = 'accepted'
     WHERE id = $1 AND addressee_id = $2 AND status = 'pending'
     RETURNING *`,
    [friendshipId, userId]
  );
  return result.rows[0];
};

export const removeFriendshipService = async (friendshipId, userId) => {
  // Either party can remove (reject pending or remove accepted)
  const result = await pool.query(
    `DELETE FROM friendships
     WHERE id = $1 AND (requester_id = $2 OR addressee_id = $2)
     RETURNING *`,
    [friendshipId, userId]
  );
  return result.rows[0];
};

export const getFriendsService = async (userId) => {
  const result = await pool.query(
    `SELECT
       f.id AS friendship_id,
       f.status,
       f.created_at,
       u.id, u.name, u.first_name, u.mail, u.avatar
     FROM friendships f
     JOIN users u ON u.id = CASE
       WHEN f.requester_id = $1 THEN f.addressee_id
       ELSE f.requester_id
     END
     WHERE (f.requester_id = $1 OR f.addressee_id = $1)
       AND f.status = 'accepted'
     ORDER BY u.first_name`,
    [userId]
  );
  return result.rows;
};

export const getPendingRequestsService = async (userId) => {
  // Requests received (you need to accept)
  const result = await pool.query(
    `SELECT f.id AS friendship_id, f.created_at,
            u.id, u.name, u.first_name, u.mail, u.avatar
     FROM friendships f
     JOIN users u ON u.id = f.requester_id
     WHERE f.addressee_id = $1 AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const getSentRequestsService = async (userId) => {
  const result = await pool.query(
    `SELECT f.id AS friendship_id, f.created_at,
            u.id, u.name, u.first_name, u.mail, u.avatar
     FROM friendships f
     JOIN users u ON u.id = f.addressee_id
     WHERE f.requester_id = $1 AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};
